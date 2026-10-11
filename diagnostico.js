/* Pruebas locales, sin telemetría ni almacenamiento. */
'use strict';
const keys = ['seguro','webgl','modulo','archivos','modelo','ar'];
const resultado = Object.fromEntries(keys.map(k=>[k,'NO REALIZADO']));
let corrida = 0;
function mostrar(k, estado, texto) {
  resultado[k] = estado + ': ' + texto;
  const el = document.getElementById('r-'+k);
  el.textContent = texto;
  el.className = estado === 'PASA' ? 'estado-ok' : estado === 'FALLA' ? 'estado-no' : 'estado-info';
}
function espera(ms) { return new Promise(r=>setTimeout(r,ms)); }
async function existeModulo(maxMs) {
  // No se supone éxito si el servidor del módulo no responde.
  const ready = customElements.get('model-viewer') ? true : await Promise.race([
    customElements.whenDefined('model-viewer').then(()=>true),
    espera(maxMs).then(()=>false)
  ]);
  return ready;
}
async function modeloCargado(elemento,maxMs) {
  if (elemento.loaded === true) return true;
  return await Promise.race([
    new Promise(resolve=>{
      elemento.addEventListener('load',()=>resolve(true),{once:true});
      elemento.addEventListener('error',()=>resolve(false),{once:true});
    }),
    espera(maxMs).then(()=>false)
  ]);
}
async function ejecutar() {
  const actual=++corrida;
  for(const k of keys) mostrar(k,'INFO','Comprobando…');
  document.getElementById('resultado-global').textContent='Comprobación en curso…';
  mostrar('seguro', location.protocol === 'https:' && isSecureContext ? 'PASA':'FALLA',
    location.protocol === 'https:' && isSecureContext ? 'HTTPS y contexto seguro: sí':'No hay HTTPS seguro: puede impedir RA (localhost sirve solo para pruebas locales)');
  let contexto=false;
  try { const c=document.createElement('canvas');contexto=!!(c.getContext('webgl2')||c.getContext('webgl')); } catch(e){}
  mostrar('webgl',contexto?'PASA':'FALLA',contexto?'WebGL accesible':'WebGL no disponible; revisar navegador o aceleración gráfica');
  const archivos=['cubo','ortoedro','prisma_triangular','piramide_cuadrangular','cilindro','cono','esfera'];
  const lecturas=await Promise.all(archivos.map(async id=>{
    try {
      const r=await fetch('modelos_glb/'+id+'.glb',{cache:'no-store'});
      if(!r.ok) return false;
      const b=await r.arrayBuffer(); const dv=new DataView(b);
      return b.byteLength>20 && dv.getUint32(0,true)===0x46546c67 && dv.getUint32(4,true)===2 && dv.getUint32(8,true)===b.byteLength;
    } catch(e) {return false;}
  }));
  if(actual!==corrida)return;
  const n=lecturas.filter(Boolean).length;
  mostrar('archivos', n===7?'PASA':'FALLA', n+' de 7 modelos GLB disponibles con cabecera válida');
  const mod=await existeModulo(7000);
  if(actual!==corrida)return;
  mostrar('modulo',mod?'PASA':'FALLA',mod?'Componente 3D registrado':'Módulo externo no disponible (conexión, política de red o bloqueo)');
  if(!mod) {
    mostrar('modelo','INFO','No evaluable sin módulo de visualización');
    mostrar('ar','INFO','No evaluable sin módulo de visualización');
  } else {
    const m=document.getElementById('modelo-prueba');
    const ok=await modeloCargado(m,6000);
    if(actual!==corrida)return;
    mostrar('modelo',ok?'PASA':'FALLA',ok?'Se recibió evento de carga del cubo 3D':'El cubo no confirmó su carga (verificar visibilidad manualmente)');
    // AR availability may be false when the component is not ready or the platform disallows it.
    const ar=(m.canActivateAR===true);
    mostrar('ar',ar?'PASA':'INFO',ar?'El visor anuncia que puede activar RA; comprobarlo físicamente':'El visor no anuncia RA en este contexto; comprobar navegador y compatibilidad');
  }
  document.getElementById('resultado-global').textContent='Comprobaciones terminadas. La prueba física de RA sigue siendo obligatoria.';
}
document.getElementById('repetir').addEventListener('click',ejecutar);
document.getElementById('copiar').addEventListener('click',async()=>{
  const informe='RA Matemáticas · diagnóstico automático (no confirma RA real)\n'+keys.map(k=>k+': '+resultado[k]).join('\n');
  try {await navigator.clipboard.writeText(informe);document.getElementById('aviso-copia').textContent='Resumen copiado. Pégalo solo donde corresponda.';}
  catch(e) {document.getElementById('aviso-copia').textContent='No se pudo copiar. Puedes transcribir los resultados.';}
});
ejecutar();
