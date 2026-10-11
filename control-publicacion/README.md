# P4.5.4-C: control de publicación de recursos visuales

## Dictamen y alcance

Candidato técnico para revisión. **La autorización definitiva por imagen permanece en NO-GO.** No se han recibido actas humanas, no hay acreditación individual de titularidad/licencia de los SVG y cuatro archivos superados/rechazados siguen presentes en el repositorio público. No se borra ni fusiona automáticamente ningún archivo.

Se inspecciona la línea base `8b0d3fa2a79c669d3ce1652a734f65d92f800dc2`. Los cinco archivos de P4.5.4-B coinciden byte a byte con el parche recuperado. El manifiesto heredado tiene ocho rutas ausentes y diez discrepancias de contenido en esa línea base; su copia y reconciliación conservan el historial. El nuevo manifiesto representa el candidato C y excluye su propia ruta para evitar una huella autorreferente.

## Cambios delimitados

- Dos SVG se generan desde los GLB existentes: pirámide triangular y cuadrangular. La altura se calcula proyectando perpendicularmente el ápice sobre el plano de la base, sin añadir una cuarta esquina a la base triangular. La transformación afín 3D→2D, vértices y huellas se registran en `geometria_p454c.json`.
- Se conservan el tronco corregido en B, el atlas, el motor de cálculo y los contenidos históricos. El esquema de evidencia/modelo conserva su corrección B; no se presenta su perspectiva como una geometría 3D acreditada ni como medible.
- El registro identifica 14 rutas actuales: diez SVG usados en actividades y cuatro archivos rasterizados excluidos de ellas. Los identificadores VIS heredados se enlazan cuando existe una correspondencia acreditada; no se inventan equivalencias para figuras ausentes ni se cuentan versiones como imágenes independientes.
- El rótulo de ilustración contemporánea pasa a ocupar una línea propia bajo la imagen: en el navegador público se observó que la posición superpuesta ocultaba parte del título del tronco.
- Se añade una página de créditos y estado de revisión enlazada desde el laboratorio de pirámides. No se atribuyen autorías humanas ni licencias sin evidencia.
- La página pública de pirámides respondió por HTTPS con 200 el 11-10-2026. Esto corrige el estado documental heredado «NO_PUBLICADO» para esa página; no prueba el despliegue del candidato C ni todas las funciones de RA.

## Ejecución

Desde la raíz del repositorio:

```bash
python3 scripts/verificar_publicacion.py --technical-only
python3 scripts/verificar_publicacion.py
```

La primera orden comprueba inventario, identidad, SVG y ausencia de referencias a archivos excluidos, además del manifiesto. La segunda añade los requisitos documentales de autorización. Salidas: 0 = control solicitado superado; 1 = fallo técnico/documental; 2 = NO-GO por pendientes. Un resultado 0 no autoriza a publicar: el cierre documental solo habilita la adjudicación humana independiente.

Las actas pueden suministrarse mediante `--actas RUTA.json`. Deben corresponder al SHA-256 exacto y aportar cuatro revisiones: geometría; historia/filología; accesibilidad; editorial/derechos. Se requieren nombre, fecha, evidencia y dictamen por rol, autoridad firmante, evidencia de firma, evidencia de derechos y pruebas de accesibilidad. El programa valida integridad documental, no autentica firmas ni acredita competencia profesional. La evidencia debe ser revisada independientemente antes del GO.

## Plantilla por archivo

```json
{
  "actas": [{
    "archivo": "RUTA_EXACTA_DEL_REGISTRO",
    "sha256": "HUELLA_EXACTA",
    "decision": "RETENIDA",
    "revisiones": [
      {"rol": "geometria", "nombre": null, "fecha": null, "evidencia": null, "dictamen": "PENDIENTE"},
      {"rol": "historia_filologia", "nombre": null, "fecha": null, "evidencia": null, "dictamen": "PENDIENTE"},
      {"rol": "accesibilidad", "nombre": null, "fecha": null, "evidencia": null, "dictamen": "PENDIENTE"},
      {"rol": "editorial_derechos", "nombre": null, "fecha": null, "evidencia": null, "dictamen": "PENDIENTE"}
    ],
    "autoridad_firmante": null,
    "fecha": null,
    "evidencia_firma": null,
    "evidencia_derechos": null,
    "evidencia_pruebas_accesibilidad": null,
    "revocada": false
  }]
}
```

No completar datos ausentes por inferencia. Cualquier modificación de bytes exige una nueva revisión sobre la huella actual. Las actas con datos personales deben conservarse en el expediente de acceso apropiado; no incorporarlas por defecto a este repositorio público.

## Pendientes y criterio de cierre

1. Resolver la custodia y exposición pública de `cubo_p8_ia.webp`, `volumen_p2_ia.webp`, `atlas_elementos_piramide.webp` y `atlas_volumen_piramide.webp`. Desenlazar no retira las URLs directas. Retirarlos del árbol actual tampoco elimina versiones históricas de Git.
2. Obtener y verificar las revisiones y autorizaciones sobre cada versión activa, incluyendo autoría y condiciones de uso acreditadas.
3. Completar teclado y zoom en vistas móvil/tableta, y lectores de pantalla reales. La inspección limitada de escritorio no acredita WCAG.
4. Revalidar la rama y el despliegue tras cualquier integración autorizada.

El informe externo de esta unidad registra verificaciones ejecutadas y limitaciones. Las pruebas históricas B (94/94 y 140/140) son antecedentes; no se presentan como reejecutadas. Los ensayos físicos de RA en Android, iPhone e iPad y el pilotaje escolar conservan P5 = NO-GO.
