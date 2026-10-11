"""Genera dos esquemas exactos desde los GLB actuales, sin dependencias externas."""
from pathlib import Path
import hashlib, json, struct

ROOT = Path(__file__).resolve().parents[1]

def vertices_glb(path):
    data = path.read_bytes()
    assert data[:4] == b'glTF' and struct.unpack_from('<I', data, 4)[0] == 2
    n = struct.unpack_from('<I', data, 12)[0]
    doc = json.loads(data[20:20+n])
    primitive = doc['meshes'][0]['primitives'][0]
    a = doc['accessors'][primitive['attributes']['POSITION']]
    v = doc['bufferViews'][a['bufferView']]
    assert a['componentType'] == 5126 and a['type'] == 'VEC3'
    offset = 28+n+v.get('byteOffset', 0)+a.get('byteOffset', 0)
    return [list(struct.unpack_from('<fff', data, offset+i*v.get('byteStride', 12))) for i in range(a['count'])]

def draw(kind):
    triangular = kind == 'triangular'
    model = ROOT / f'modelos_glb/historico_piramide_{kind}_didactica.glb'
    vertices = vertices_glb(model)
    base_y = min(v[1] for v in vertices)
    base = [v for v in vertices if abs(v[1]-base_y) < 1e-6]
    apex, = [v for v in vertices if v[1] > base_y+1e-6]
    foot = [apex[0], base_y, apex[2]]
    x_coefficient,z_coefficient = (300,80) if triangular else (225,145)
    def project(v):
        x,y,z = [v[i]-foot[i] for i in range(3)]
        return [480+x_coefficient*x-z_coefficient*z, 380+68*x+103*z-170*y]
    def point(v):
        return ','.join(f'{n:.2f}' for n in project(v))
    assert len(base) == (3 if triangular else 4)
    # Los ejes x y z pertenecen al plano de la base; la altura solo cambia y.
    assert foot[0] == apex[0] and foot[2] == apex[2] and apex[1] > foot[1]
    if triangular:
        a,b,c = base[1],base[0],base[2]
        faces = [[apex,a,c],[apex,c,b]]
        hidden = f'M{point(a)} L{point(b)}'
        counts = '4 caras · 6 aristas · 4 vértices'
        title = 'PIRÁMIDE TRIANGULAR'
        desc = 'Una base triangular y tres caras laterales triangulares. La altura h une el vértice con su proyección perpendicular sobre el plano de la base.'
    else:
        a,b,c,d = base
        faces = [[apex,d,c],[apex,c,b]]
        hidden = f'M{point(d)} L{point(a)} L{point(b)} M{point(apex)} L{point(a)}'
        counts = '5 caras · 8 aristas · 5 vértices'
        title = 'PIRÁMIDE DE BASE CUADRADA'
        desc = 'Una base cuadrada y cuatro caras laterales triangulares. La altura h une el vértice con el centro O de la base y es perpendicular a su plano.'
    px,py = project(apex); fx,fy = project(foot)
    fills = ['#E7B773','#C68B57']
    polys = '\n'.join(f'<polygon points="{" ".join(point(v) for v in face)}" fill="{fill}" stroke="#835B3D" stroke-width="4" stroke-linejoin="round"/>' for face,fill in zip(faces,fills))
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 600" role="img" aria-labelledby="titulo descripcion">
<title id="titulo">{title.capitalize()}: esquema matemático moderno</title>
<desc id="descripcion">{desc} Las aristas ocultas y la altura interior se muestran por transparencia con trazos discontinuos. No reproduce el papiro ni está a escala métrica. Coordenadas derivadas del modelo GLB del proyecto.</desc>
<defs><linearGradient id="fondo" x2="1" y2="1"><stop stop-color="#FFF8EA"/><stop offset="1" stop-color="#E6F3F3"/></linearGradient></defs>
<rect width="960" height="600" rx="28" fill="url(#fondo)"/>
<text x="48" y="53" font-family="DejaVu Sans,sans-serif" font-size="30" font-weight="800" fill="#153F53">{title}</text>
<path d="M48 70H912" stroke="#C7B398" stroke-width="2"/>
{polys}
<path id="aristas-ocultas" d="{hidden}" fill="none" stroke="#4E514D" stroke-width="3" stroke-dasharray="8 8"/>
<path id="altura" d="M{point(apex)} L{point(foot)}" fill="none" stroke="#064E68" stroke-width="5" stroke-dasharray="10 8"/>
<circle id="pie-altura" cx="{fx:.2f}" cy="{fy:.2f}" r="7" fill="#064E68" stroke="#FFF" stroke-width="2"/>
<text x="{fx+18:.2f}" y="{(py+fy)/2:.2f}" font-family="DejaVu Sans,sans-serif" font-size="32" font-weight="800" fill="#064E68">h</text>
<rect x="690" y="190" width="220" height="106" rx="12" fill="#FFF" stroke="#9BBCC2" stroke-width="2"/>
<text x="706" y="225" font-family="DejaVu Sans,sans-serif" font-size="23" font-weight="700" fill="#15495C">Altura interior</text>
<text x="706" y="263" font-family="DejaVu Sans,sans-serif" font-size="20" fill="#15495C">perpendicular</text>
<text x="48" y="520" font-family="DejaVu Sans,sans-serif" font-size="23" font-weight="700" fill="#254A59">{counts} · base {'triangular' if triangular else 'cuadrada'}</text>
<text x="48" y="563" font-family="DejaVu Sans,sans-serif" font-size="20" fill="#254A59">Esquema moderno · sin escala métrica · no reproduce el papiro</text>
</svg>
'''
    path = ROOT / ('ilustraciones/piramides_triangular_didactica.svg' if triangular else 'ilustraciones/piramide_cuadrangular_didactica.svg')
    path.write_text(svg,encoding='utf-8')
    return {'archivo':str(path.relative_to(ROOT)), 'modelo':str(model.relative_to(ROOT)), 'modelo_sha256':hashlib.sha256(model.read_bytes()).hexdigest(), 'svg_sha256':hashlib.sha256(path.read_bytes()).hexdigest(), 'vertices_3d':vertices, 'base_3d':base, 'apice_3d':apex, 'pie_altura_3d':foot, 'apice_proyectado':project(apex), 'pie_proyectado':project(foot), 'proyeccion':[[x_coefficient,0,-z_coefficient,480-x_coefficient*foot[0]+z_coefficient*foot[2]],[68,-170,103,380-68*foot[0]+170*foot[1]-103*foot[2]]], 'escala':'SIN_ESCALA_METRICA', 'nota':'Altura perpendicular en 3D; su proyección 2D no conserva ángulos.'}

if __name__ == '__main__':
    out = ROOT / 'control-publicacion'
    out.mkdir(exist_ok=True)
    (out/'geometria_p454c.json').write_text(json.dumps([draw(k) for k in ['triangular','cuadrangular']],ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
