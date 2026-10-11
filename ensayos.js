/* Registro declarativo local; no envía datos. P5 sigue sujeto a revisión humana. */
'use strict';
const VERSION='0.3-P4.1';
const PRUEBAS=[
 ['HTTPS','La página se abre bajo HTTPS y sin errores de certificado.'],
 ['GLB7','Las siete figuras se cargan y pueden examinarse en 3D.'],
 ['CUBO3D','El cubo se puede girar y sus propiedades se muestran correctamente.'],
 ['CUBORA','El cubo aparece anclado efectivamente sobre una superficie real.'],
 ['PRISMA3D','El prisma triangular puede visualizarse y girarse.'],
 ['PRISMARA','El prisma triangular aparece anclado efectivamente sobre una superficie real.'],
 ['RETORNO','Es posible salir de RA y regresar a la actividad sin pérdida funcional.'],
 ['RETO','Es posible escribir una respuesta y consultar la explicación.'],
 ['FALLBACK','Cuando se bloquea la RA, la alternativa 3D o el material físico resulta utilizable.'],
 ['PRIVACIDAD','No se solicita ni registra información personal del alumnado.'],
 ['SEGURIDAD','No se observaron incidencias críticas de seguridad en la utilización prevista.'],
 ['TECLADO','Los controles principales se pueden manejar con teclado externo.'],
 ['LECTOR','Se ha realizado una comprobación asistida con lector de pantalla.']
];
const selectStatus=['NO REALIZADO','PASA','FALLA','BLOQUEADO'];
let ultimoCSV='';
const pruebas=document.getElementById('pruebas');
PRUEBAS.forEach(([id,descripcion])=>{
 const wrap=document.createElement('div');wrap.className='prueba';
 const p=document.createElement('p');p.textContent=id+' · '+descripcion;wrap.append(p);
 const label=document.createElement('label');label.textContent='Resultado de '+id;
 const select=document.createElement('select');select.id='p-'+id;select.setAttribute('aria-label',descripcion);
 selectStatus.forEach(s=>{const opt=document.createElement('option');opt.value=s;opt.textContent=s;select.append(opt)});
 label.append(select);wrap.append(label);pruebas.append(wrap);
});
function celda(s){s=String(s??'');if (/^[\s]*[=+@-]/.test(s)) s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}
function csv(r){return '\ufeff'+r.map(row=>row.map(celda).join(';')).join('\r\n')+'\r\n';}
function salida(e){
 e.preventDefault();
 const plataforma=document.getElementById('plataforma').value;
 const equipo=document.getElementById('equipo').value.trim().toUpperCase();
 const fecha=document.getElementById('fecha').value;
 const lote=document.getElementById('lote').value.trim().toUpperCase();
 const nota=document.getElementById('nota').value.trim();
 const fisico=document.getElementById('fisico').checked;
 if(!['ANDROID','IPHONE','IPAD'].includes(plataforma)||!/^[A-Z0-9_-]{1,12}$/.test(equipo)||!/^\d{4}-\d{2}-\d{2}$/.test(fecha)|| !/^[A-Z0-9_-]{0,12}$/.test(lote)){
  document.getElementById('mensaje').textContent='Revisa los campos obligatorios y los códigos.';return;
 }
 const headers=['version','tipo_ensayo','plataforma','codigo_equipo','fecha','lote','prueba_id','estado','observacion'];
 const rows=[headers];
 for(const [id] of PRUEBAS){const est=document.getElementById('p-'+id).value;
  rows.push([VERSION,fisico?'FISICO_DECLARADO':'PREPARACION',plataforma,equipo,fecha,lote,id,est,nota]);
 }
 ultimoCSV=csv(rows);document.getElementById('copiar-csv').disabled=false;
 document.getElementById('csv-manual-wrap').hidden=true;
 const file=new Blob([ultimoCSV],{type:'text/csv;charset=utf-8'});
 const url=URL.createObjectURL(file);const a=document.createElement('a');a.href=url;
 a.download='P5_'+plataforma+'_'+equipo+'_'+fecha+'.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
 document.getElementById('mensaje').textContent='CSV descargado localmente. Revisa que la descarga se haya completado; no se ha enviado ningún resultado.';
}
document.getElementById('registro').addEventListener('submit',salida);
document.getElementById('copiar-csv').addEventListener('click',async()=>{
 if(!ultimoCSV)return;
 try{if(!navigator.clipboard?.writeText)throw new Error('Clipboard no disponible');
 await navigator.clipboard.writeText(ultimoCSV);
 document.getElementById('mensaje').textContent='CSV copiado al portapapeles; pégalo en un archivo de texto y guárdalo como .csv.';
 }catch(e){document.getElementById('csv-manual-wrap').hidden=false;
 const t=document.getElementById('csv-manual');t.value=ultimoCSV;t.focus();t.select();
 document.getElementById('mensaje').textContent='El portapapeles no está disponible. Copia manualmente el texto seleccionado del campo.';}
});
document.getElementById('reiniciar').addEventListener('click',()=>{
 document.querySelectorAll('#pruebas select').forEach(s=>s.value='NO REALIZADO');
 document.getElementById('fisico').checked=false;
 document.getElementById('nota').value='';
 ultimoCSV='';document.getElementById('copiar-csv').disabled=true;
 document.getElementById('csv-manual-wrap').hidden=true;
 document.getElementById('csv-manual').value='';
 document.getElementById('mensaje').textContent='Resultados restablecidos.';
});
