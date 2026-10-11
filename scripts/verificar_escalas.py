"""Revisión métrica local. No valida tamaño físico de RA ni fuentes antiguas.

Lector deliberadamente limitado a las mallas estáticas del proyecto: rechaza
transformaciones, extensiones, animaciones y formatos no soportados en lugar
de emitir medidas basadas en un supuesto de identidad.
"""
from pathlib import Path
import hashlib
import json
import math
import struct
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
NS = '{http://www.w3.org/2000/svg}'
TOLERANCIA_CM = 0.0001


def dimensiones_glb(path):
    data = path.read_bytes()
    magic, version, length = struct.unpack_from('<4sII', data)
    if magic != b'glTF' or version != 2 or length != len(data):
        raise ValueError('Cabecera GLB no soportada')
    chunks, offset = {}, 12
    while offset < length:
        size, kind = struct.unpack_from('<II', data, offset)
        if kind in chunks or offset + 8 + size > length:
            raise ValueError('Chunks GLB inválidos')
        chunks[kind] = data[offset + 8:offset + 8 + size]
        offset += 8 + size
    doc = json.loads(chunks[0x4E4F534A])
    binary = chunks[0x004E4942]
    if doc['asset']['version'] != '2.0' or any(doc.get(k) for k in ('extensionsUsed', 'animations', 'skins')):
        raise ValueError('GLB dinámico o con extensiones no soportado')
    if len(doc['buffers']) != 1 or 'uri' in doc['buffers'][0]:
        raise ValueError('Solo se admite el buffer interno del GLB')
    # Los archivos auditados tienen una escena, sin transformaciones de nodo.
    if len(doc['scenes']) != 1 or doc.get('scene', 0) != 0:
        raise ValueError('Escenas múltiples no soportadas')
    nodes = doc['nodes']
    vertices, visited = [], set()

    def visit(index):
        if index in visited:
            raise ValueError('Jerarquía repetida o cíclica')
        visited.add(index)
        node = nodes[index]
        if any(k in node for k in ('matrix', 'translation', 'rotation', 'scale', 'skin', 'weights', 'extensions')):
            raise ValueError('Transformación o deformación de nodo no soportada')
        if 'mesh' in node:
            for p in doc['meshes'][node['mesh']]['primitives']:
                if p.get('targets') or p.get('extensions') or p.get('mode', 4) != 4:
                    raise ValueError('Primitiva no estática o no triangular')
                a = doc['accessors'][p['attributes']['POSITION']]
                if a['componentType'] != 5126 or a['type'] != 'VEC3' or a.get('sparse') or a.get('normalized'):
                    raise ValueError('Accessor POSITION no soportado')
                v = doc['bufferViews'][a['bufferView']]
                if v['buffer'] != 0:
                    raise ValueError('Buffer externo no soportado')
                start = v.get('byteOffset', 0) + a.get('byteOffset', 0)
                stride = v.get('byteStride', 12)
                end = start + (a['count'] - 1) * stride + 12
                if a['count'] < 1 or stride < 12 or end > len(binary) or end > v.get('byteOffset', 0) + v['byteLength']:
                    raise ValueError('Rango POSITION inválido')
                vertices.extend(struct.unpack_from('<fff', binary, start + i * stride) for i in range(a['count']))
        for child in node.get('children', []):
            visit(child)

    for index in doc['scenes'][0]['nodes']:
        visit(index)
    if not vertices or not all(math.isfinite(x) for v in vertices for x in v):
        raise ValueError('Malla vacía o coordenadas no finitas')
    return [(max(v[i] for v in vertices) - min(v[i] for v in vertices)) * 100 for i in range(3)]


def medidas_texto(f):
    x, y, z = f['dimensiones_cm']
    return {
        'cubo': f'Arista: {x} cm',
        'ortoedro': f'Largo: {x} cm · ancho: {z} cm · alto: {y} cm',
        'prisma_triangular': f'Base del triángulo: {x} cm · altura del triángulo: {y} cm · longitud del prisma: {z} cm',
        'piramide_cuadrangular': f'Lado de la base: {x} cm · altura perpendicular: {y} cm',
        'cilindro': f'Diámetro: {x} cm · altura: {y} cm',
        'cono': f'Diámetro: {x} cm · altura perpendicular: {y} cm',
        'esfera': f'Diámetro: {x} cm',
    }[f['id']]


def plantilla_cm(path):
    svg = ET.parse(path).getroot()
    if svg.get('width') != '210mm' or svg.get('height') != '297mm' or svg.get('viewBox') != '0 0 210 297':
        raise ValueError('Plantilla sin correspondencia física A4 verificada')
    faces = [e for e in svg.findall(NS + 'rect') if e.get('width') == '30' and e.get('height') == '30']
    control = [e for e in svg.findall(NS + 'line') if e.get('y1') == e.get('y2') == '228']
    if len(faces) != 6 or len(control) != 1:
        raise ValueError('Caras o línea de control diferentes')
    line = control[0]
    if abs(float(line.get('x2')) - float(line.get('x1'))) != 30:
        raise ValueError('Línea de control diferente de 3 cm')
    return 3


def inspect(root):
    catalog = json.loads((root / 'catalogo.json').read_text())
    ids = {'cubo', 'ortoedro', 'prisma_triangular', 'piramide_cuadrangular', 'cilindro', 'cono', 'esfera'}
    if len(catalog) != len(ids) or {f['id'] for f in catalog} != ids:
        raise ValueError('Catálogo de siete modelos incompleto')
    js = (root / 'catalogo.js').read_text().strip()
    if not js.startswith('const CATALOGO = ') or json.loads(js.removeprefix('const CATALOGO = ').removesuffix(';')) != catalog:
        raise ValueError('Catálogo JS y JSON diferentes')
    registry = json.loads((root / 'control-publicacion/escalas_revision.json').read_text())
    visual = json.loads((root / 'control-publicacion/recursos_visuales.json').read_text())['recursos']
    if {v['archivo'] for v in visual} != {v['archivo'] for v in registry['imagenes']} or len(registry['imagenes']) != len(visual):
        raise ValueError('Inventario visual de escalas incompleto')
    for entry in registry['imagenes']:
        if hashlib.sha256((root / entry['archivo']).read_bytes()).hexdigest() != entry['sha256']:
            raise ValueError('Imagen modificada: ' + entry['archivo'])
        if entry['decision'] not in {'PLANTILLA_FISICA_3_CM', 'COTAS_EJEMPLO_SIN_ESCALA', 'SIN_ESCALA_METRICA', 'EXCLUIDA'}:
            raise ValueError('Decisión visual no admitida')
        if entry['archivo'].endswith('.webp') and entry['decision'] != 'EXCLUIDA':
            raise ValueError('Raster excluido con escala nueva')
        source = next(v for v in visual if v['archivo'] == entry['archivo'])
        decision = ('EXCLUIDA' if source['uso'] != 'ACTIVA' else
                    'PLANTILLA_FISICA_3_CM' if entry['archivo'] == 'desarrollo-cubo.svg' else
                    'COTAS_EJEMPLO_SIN_ESCALA' if entry['archivo'] == 'ilustraciones/auditoria_volumen_piramide.svg' else
                    'SIN_ESCALA_METRICA')
        if entry['decision'] != decision:
            raise ValueError('Clasificación métrica incoherente: ' + entry['archivo'])
    expected = {str(p.relative_to(root)) for p in (root / 'modelos_glb').glob('*.glb')}
    if expected != {m['archivo'] for m in registry['modelos']} or len(registry['modelos']) != len(expected):
        raise ValueError('Inventario de modelos incompleto')
    page = (root / 'escalas.html').read_text()
    for model in registry['modelos']:
        path = root / model['archivo']
        actual = dimensiones_glb(path)
        if hashlib.sha256(path.read_bytes()).hexdigest() != model['sha256']:
            raise ValueError('Modelo modificado: ' + model['archivo'])
        ext = model['extension_xyz_cm']
        if len(ext) != 3 or not all(math.isfinite(b) for b in ext) or any(abs(a - b) > TOLERANCIA_CM for a, b in zip(actual, ext)):
            raise ValueError('Extensión GLB diferente: ' + model['archivo'])
        f = next((f for f in catalog if f['glb'] == model['archivo']), None)
        if f:
            if len(f['dimensiones_cm']) != 3 or any(abs(a - b) > TOLERANCIA_CM for a, b in zip(actual, f['dimensiones_cm'])):
                raise ValueError('Dimensiones nominales diferentes: ' + f['id'])
            if f['glb_sha256'] != model['sha256'] or f['medidas_texto'] != medidas_texto(f) or f['medidas_texto'] not in page:
                raise ValueError('Referencia didáctica diferente: ' + f['id'])
            if model['interpretacion'] != 'MODELO_MATEMATICO_NOMINAL':
                raise ValueError('Modelo nominal sin clasificación')
        elif model['interpretacion'] != 'MODELO_RELATIVO_NO_MEDIDA_HISTORICA':
            raise ValueError('Medida histórica no acreditada')
    original = next(f for f in catalog if f['id'] == 'cubo')['dimensiones_cm'][0]
    paper = plantilla_cm(root / 'desarrollo-cubo.svg')
    if registry['comparacion_cubo'] != {'arista_nominal_cm': original, 'arista_papel_cm': paper, 'escala': '1:4'} or original / paper != 4:
        raise ValueError('Comparación 1:4 incoherente')
    if '3 cm ÷ 12 cm = 1/4' not in page or 'sin escala métrica' not in page:
        raise ValueError('Explicación de escala incompleta')
    diagram = ET.parse(root / 'ilustraciones/auditoria_volumen_piramide.svg').getroot()
    labels = [e.text for e in diagram.findall(NS + 'text')]
    if labels.count('a = 6 m') != 2 or labels.count('h = 4 m') != 2 or not any('no está a escala' in (s or '') for s in labels):
        raise ValueError('Cotas escolares o aviso sin escala ausentes')
    if diagram.find(f"{NS}g[@id='cota-base']") is None:
        raise ValueError('Cota de base sin línea indicadora')
    if registry['validacion_ra_fisica'] != 'PENDIENTE':
        raise ValueError('La revisión local no certifica RA física')
    return {'control_metrico_local': 'PASS', 'modelos_glb': len(expected), 'imagenes': len(visual), 'comparacion_cubo': '1:4', 'validacion_ra_fisica': 'PENDIENTE'}


if __name__ == '__main__':
    try:
        print(json.dumps(inspect(ROOT), ensure_ascii=False, indent=2))
    except (OSError, ValueError, KeyError, TypeError, IndexError, struct.error, ET.ParseError) as error:
        print(json.dumps({'control_metrico_local': 'FAIL', 'error': str(error)}, ensure_ascii=False))
        raise SystemExit(1)
