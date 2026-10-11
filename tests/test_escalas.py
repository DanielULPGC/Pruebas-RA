"""Regresiones de unidades, impresión y clasificaciones métricas."""
import importlib.util
import json
from pathlib import Path
import shutil
import struct
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('scales', ROOT / 'scripts/verificar_escalas.py')
scales = importlib.util.module_from_spec(spec)
spec.loader.exec_module(scales)


class ScaleTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name) / 'fixture'
        shutil.copytree(ROOT, self.root, ignore=shutil.ignore_patterns('.git', '__pycache__'))

    def tearDown(self):
        self.temp.cleanup()

    def update_registry(self, change):
        path = self.root / 'control-publicacion/escalas_revision.json'
        data = json.loads(path.read_text())
        change(data)
        path.write_text(json.dumps(data))

    def test_current_dimensions_and_print_geometry(self):
        result = scales.inspect(self.root)
        self.assertEqual(result['control_metrico_local'], 'PASS')
        self.assertEqual((result['modelos_glb'], result['imagenes']), (11, 14))
        self.assertEqual(result['validacion_ra_fisica'], 'PENDIENTE')

    def test_wrong_catalog_dimensions_are_rejected_even_when_js_agrees(self):
        path = self.root / 'catalogo.json'
        data = json.loads(path.read_text())
        data[0]['dimensiones_cm'] = [120, 120, 120]
        path.write_text(json.dumps(data))
        (self.root / 'catalogo.js').write_text('const CATALOGO = ' + json.dumps(data) + ';')
        with self.assertRaisesRegex(ValueError, 'Dimensiones nominales'):
            scales.inspect(self.root)

    def test_print_units_and_control_length(self):
        path = self.root / 'desarrollo-cubo.svg'
        original = path.read_text()
        for bad in [original.replace('210mm', '210px'), original.replace('x2="48"', 'x2="49"')]:
            path.write_text(bad)
            with self.assertRaises(ValueError):
                scales.plantilla_cm(path)

    def test_node_scale_is_not_ignored(self):
        path = self.root / 'modelos_glb/cubo.glb'
        data = path.read_bytes()
        size = struct.unpack_from('<I', data, 12)[0]
        doc = json.loads(data[20:20 + size])
        doc['nodes'][0]['scale'] = [2, 2, 2]
        payload = json.dumps(doc).encode()
        payload += b' ' * (-len(payload) % 4)
        rest = data[20 + size:]
        path.write_bytes(struct.pack('<4sII', b'glTF', 2, 20 + len(payload) + len(rest)) + struct.pack('<II', len(payload), 0x4E4F534A) + payload + rest)
        with self.assertRaisesRegex(ValueError, 'Transformación'):
            scales.dimensiones_glb(path)

    def test_historical_model_cannot_be_declared_nominal(self):
        def change(data):
            next(m for m in data['modelos'] if 'historico' in m['archivo'])['interpretacion'] = 'MODELO_MATEMATICO_NOMINAL'
        self.update_registry(change)
        with self.assertRaisesRegex(ValueError, 'histórica'):
            scales.inspect(self.root)

    def test_local_audit_cannot_claim_physical_ar_validation(self):
        self.update_registry(lambda data: data.update(validacion_ra_fisica='VALIDADA'))
        with self.assertRaisesRegex(ValueError, 'RA física'):
            scales.inspect(self.root)

    def test_catalog_versions_must_agree(self):
        path = self.root / 'catalogo.js'
        path.write_text(path.read_text().replace('"nombre": "Cubo"', '"nombre": "Otra figura"'))
        with self.assertRaisesRegex(ValueError, 'Catálogo JS'):
            scales.inspect(self.root)

    def test_metric_record_must_have_three_axes(self):
        self.update_registry(lambda data: data['modelos'][0].update(extension_xyz_cm=[]))
        with self.assertRaisesRegex(ValueError, 'Extensión GLB'):
            scales.inspect(self.root)

    def test_visual_classification_cannot_add_an_unjustified_scale(self):
        def change(data):
            next(v for v in data['imagenes'] if 'escriba_p2' in v['archivo'])['decision'] = 'COTAS_EJEMPLO_SIN_ESCALA'
        self.update_registry(change)
        with self.assertRaisesRegex(ValueError, 'Clasificación métrica'):
            scales.inspect(self.root)


if __name__ == '__main__':
    unittest.main()
