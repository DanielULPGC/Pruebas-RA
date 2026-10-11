"""Regresiones del control; las actas sintéticas nunca salen del directorio temporal."""
import copy, hashlib, importlib.util, json, shutil, tempfile, unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('gate',ROOT/'scripts/verificar_publicacion.py')
gate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gate)

class PublicationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)/'fixture'
        shutil.copytree(ROOT,self.root,ignore=shutil.ignore_patterns('.git','__pycache__'))
    def tearDown(self):
        self.temp.cleanup()
    def synthetic_act(self):
        path='desarrollo-cubo.svg'
        return {'archivo':path,'sha256':gate.digest(self.root/path),'decision':'APROBADA_DOCUMENTALMENTE','revisiones':[{'rol':role,'nombre':'REVISOR_SINTETICO_NO_REAL','fecha':'2026-10-11','evidencia':'PRUEBA_SINTETICA_NO_VALIDA','dictamen':'FAVORABLE'} for role in sorted(gate.ROLES)],'autoridad_firmante':'FIRMANTE_SINTETICO_NO_REAL','fecha':'2026-10-11','evidencia_firma':'PRUEBA_SINTETICA_NO_VALIDA','evidencia_derechos':'PRUEBA_SINTETICA_NO_VALIDA','evidencia_pruebas_accesibilidad':'PRUEBA_SINTETICA_NO_VALIDA','revocada':False}
    def test_current_bytes_pass_technical_and_block_release(self):
        result = gate.inspect(self.root)
        self.assertEqual(result['control_tecnico'],'PASS')
        self.assertEqual(result['publicacion_definitiva'],'NO_GO')
        self.assertEqual((result['recursos'],result['activos'],result['excluidos_presentes']),(14,10,4))
    def test_modified_image_invalidates_identity(self):
        p=self.root/'ilustraciones/tronco_piramide_didactica.svg'
        p.write_text(p.read_text()+'\n')
        self.assertEqual(gate.inspect(self.root)['control_tecnico'],'FAIL')
    def test_new_unregistered_image_is_detected(self):
        (self.root/'sin_registrar.svg').write_text('<svg/>')
        self.assertEqual(gate.inspect(self.root)['control_tecnico'],'FAIL')
    def test_excluded_image_cannot_be_relinked(self):
        p=self.root/'piramides-historia.html'
        p.write_text(p.read_text()+'<img src="ilustraciones/cubo_p8_ia.webp">')
        self.assertTrue(any('Referencia a recurso excluido' in x for x in gate.inspect(self.root)['errores_tecnicos']))
    def test_textual_inventory_does_not_link_excluded_images(self):
        parsed=gate.References()
        parsed.feed('<td>ilustraciones/cubo_p8_ia.webp</td>')
        self.assertEqual(parsed.references,[])
    def test_unregistered_new_text_invalidates_manifest(self):
        (self.root/'nuevo.txt').write_text('dato de prueba')
        self.assertIn('Cobertura incompleta del manifiesto',gate.inspect(self.root)['errores_tecnicos'])
    def test_empty_act_is_rejected(self):
        result=gate.inspect(self.root,{'actas':[{'archivo':'desarrollo-cubo.svg'}]})
        self.assertEqual(result['control_tecnico'],'FAIL')
    def test_obsolete_hash_is_rejected(self):
        act=self.synthetic_act();act['sha256']='0'*64
        result=gate.inspect(self.root,{'actas':[act]})
        self.assertEqual(result['control_tecnico'],'FAIL')
    def test_revoked_act_is_rejected(self):
        act=self.synthetic_act();act['revocada']=True
        self.assertEqual(gate.inspect(self.root,{'actas':[act]})['control_tecnico'],'FAIL')
    def test_missing_review_role_is_rejected(self):
        act=self.synthetic_act();act['revisiones'].pop()
        self.assertEqual(gate.inspect(self.root,{'actas':[act]})['control_tecnico'],'FAIL')
    def test_structural_act_does_not_authorize_release(self):
        result=gate.inspect(self.root,{'actas':[self.synthetic_act()]})
        self.assertEqual(result['control_tecnico'],'PASS')
        self.assertEqual(result['publicacion_definitiva'],'NO_GO')
        self.assertEqual(len(result['pendientes_publicacion']),13)
    def test_duplicate_act_is_rejected(self):
        act={'archivo':'desarrollo-cubo.svg'}
        self.assertTrue(any('duplicadas' in x for x in gate.inspect(self.root,{'actas':[act,copy.deepcopy(act)]})['errores_tecnicos']))
    def test_geometry_foot_is_perpendicular_and_hashes_match(self):
        data=json.loads((self.root/'control-publicacion/geometria_p454c.json').read_text())
        for item in data:
            apex,foot=item['apice_3d'],item['pie_altura_3d']
            self.assertEqual(apex[0],foot[0]);self.assertEqual(apex[2],foot[2])
            self.assertGreater(apex[1],foot[1])
            self.assertEqual(item['svg_sha256'],gate.digest(self.root/item['archivo']))
            self.assertEqual(item['modelo_sha256'],gate.digest(self.root/item['modelo']))
            for p in item['vertices_3d']:
                uv=[sum(row[i]*p[i] for i in range(3))+row[3] for row in item['proyeccion']]
                self.assertTrue(70 < uv[0] < 890 and 85 < uv[1] < 510)

if __name__=='__main__':
    unittest.main()
