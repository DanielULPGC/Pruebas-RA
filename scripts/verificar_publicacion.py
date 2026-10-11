"""Control P4.5.4-C. No emite autorizaciones humanas ni certifica accesibilidad."""
from pathlib import Path
import argparse, hashlib, json, re, sys
import xml.etree.ElementTree as ET
from html.parser import HTMLParser

ROOT = Path(__file__).resolve().parents[1]
EXTENSIONS = {'.svg', '.png', '.webp', '.jpg', '.jpeg'}
ROLES = {'geometria', 'historia_filologia', 'accesibilidad', 'editorial_derechos'}

class References(HTMLParser):
    def __init__(self):
        super().__init__()
        self.references = []
    def handle_starttag(self, tag, attrs):
        for key,value in attrs:
            if key in {'href','src','poster','srcset','data'} and value:
                self.references.append(value)

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def inspect(root, approvals=None):
    registry = json.loads((root/'control-publicacion/recursos_visuales.json').read_text(encoding='utf-8'))
    assets = registry['recursos']
    failures, pending = [], []
    paths = [a['archivo'] for a in assets]
    if len(paths) != len(set(paths)):
        failures.append('Rutas duplicadas en el registro')
    present = {str(p.relative_to(root)) for p in root.rglob('*') if p.is_file() and p.suffix.lower() in EXTENSIONS and '.git' not in p.parts}
    if set(paths) != present:
        failures.append('El inventario no coincide con las imágenes presentes')
    for a in assets:
        p = root/a['archivo']
        if not p.is_file() or digest(p) != a['sha256']:
            failures.append('Identidad diferente o archivo ausente: '+a['archivo'])
        if p.suffix == '.svg' and p.is_file():
            try:
                element = ET.fromstring(p.read_text(encoding='utf-8'))
                ns = '{http://www.w3.org/2000/svg}'
                if any(element.find(ns+n) is None for n in ['title','desc']):
                    failures.append('SVG sin alternativa interna: '+a['archivo'])
                if any(e.tag.rsplit('}',1)[-1] in {'script','foreignObject','image'} for e in element.iter()):
                    failures.append('SVG con contenido activo/externo no admitido: '+a['archivo'])
            except ET.ParseError:
                failures.append('SVG inválido: '+a['archivo'])
        if a['uso'] == 'EXCLUIDA_DEL_RECURSO':
            pending.append('Archivo superado/rechazado aún presente en el árbol público: '+a['archivo'])
        if a['uso'] == 'ACTIVA':
            pending.append('Acta humana vinculada a bytes pendiente: '+a['archivo'])
    excluded = [a['archivo'] for a in assets if a['uso'] == 'EXCLUIDA_DEL_RECURSO']
    for p in root.iterdir():
        if p.suffix in {'.html','.mjs','.js','.css'}:
            text = p.read_text(encoding='utf-8')
            if p.suffix == '.html':
                parsed = References(); parsed.feed(text)
                references = parsed.references
            else:
                references = re.findall(r'''["']([^"']+)["']''',text)
            for path in excluded:
                if any(path in ref for ref in references):
                    failures.append('Referencia a recurso excluido: '+str(p.relative_to(root))+' -> '+path)
    manifest = json.loads((root/'MANIFIESTO_PUBLICACION.json').read_text(encoding='utf-8'))
    # Excluir solo el manifiesto, para evitar autorreferencia; no excluir archivos nuevos.
    all_files = {str(p.relative_to(root)) for p in root.rglob('*') if p.is_file() and '.git' not in p.parts and p.name != 'MANIFIESTO_PUBLICACION.json' and '__pycache__' not in p.parts}
    if set(manifest['archivos']) != all_files:
        failures.append('Cobertura incompleta del manifiesto')
    for path,sha in manifest['archivos'].items():
        p = root/path
        if not p.is_file() or digest(p) != sha:
            failures.append('Manifiesto no coincide: '+path)
    valid = set()
    seen = set()
    for act in (approvals or {}).get('actas',[]):
        path = act.get('archivo')
        if path in seen:
            failures.append('Actas duplicadas: '+str(path))
            continue
        seen.add(path)
        asset = next((a for a in assets if a['archivo'] == path),None)
        reviewers = act.get('revisiones',[])
        roles = {r.get('rol') for r in reviewers}
        ok = asset is not None and asset['uso'] == 'ACTIVA' and act.get('sha256') == asset['sha256']
        ok = ok and roles == ROLES and len(reviewers) == len(ROLES)
        ok = ok and all(r.get('nombre') and r.get('fecha') and r.get('evidencia') and r.get('dictamen') == 'FAVORABLE' for r in reviewers)
        ok = ok and act.get('decision') in {'APROBADA_DOCUMENTALMENTE','APROBADA_CON_CORRECCIONES_VERIFICADAS'}
        ok = ok and act.get('autoridad_firmante') and act.get('fecha') and act.get('evidencia_firma')
        ok = ok and act.get('evidencia_derechos') and act.get('evidencia_pruebas_accesibilidad') and not act.get('revocada',False)
        if ok:
            valid.add(path)
        else:
            failures.append('Acta incompleta, revocada o no vinculada a bytes actuales: '+str(path))
    pending = [s for s in pending if not (s.startswith('Acta humana') and s.split(': ',1)[1] in valid)]
    ready = not failures and not pending
    return {'fase':'P4.5.4-C', 'recursos':len(assets), 'activos':sum(a['uso']=='ACTIVA' for a in assets), 'excluidos_presentes':len(excluded), 'errores_tecnicos':failures, 'pendientes_publicacion':pending, 'control_tecnico':'PASS' if not failures else 'FAIL', 'control_documental':'PASS' if ready else 'NO_GO', 'publicacion_definitiva':'PENDIENTE_ADJUDICACION_HUMANA' if ready else 'NO_GO', 'limite':'Comprueba integridad y requisitos documentales. La autenticidad y competencia de las firmas requieren revisión humana independiente; no certifica WCAG, RA ni aprendizaje.'}

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--technical-only',action='store_true')
    parser.add_argument('--actas',type=Path)
    args = parser.parse_args()
    try:
        result = inspect(ROOT, json.loads(args.actas.read_text(encoding='utf-8')) if args.actas else None)
        print(json.dumps(result,ensure_ascii=False,indent=2))
        sys.exit(1 if result['errores_tecnicos'] else 0 if args.technical_only or result['control_documental']=='PASS' else 2)
    except (OSError, ValueError, KeyError, TypeError) as error:
        print(json.dumps({'control_tecnico':'FAIL','error':str(error)},ensure_ascii=False))
        sys.exit(1)
