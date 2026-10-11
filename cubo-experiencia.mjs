/* P4.5.2-C · Navegación complementaria sin modificar el motor SVG. */
const n=$=>document.getElementById($);
const tabs=Array.from(document.querySelectorAll('[data-paso]'));
const panels=[0,1,2,3].map(i=>n(`paso${i}`));
let current=0;
function stageTo(next,{focus=true}={}){
  const i=Math.max(0,Math.min(3,Number(next)));
  current=i;
  panels.forEach((panel,k)=>{panel.hidden=k!==i});
  tabs.forEach((tab,k)=>{
    const active=k===i;tab.classList.toggle('selected',active);
    if(active)tab.setAttribute('aria-current','step');else tab.removeAttribute('aria-current');
  });
  n('paso-indicador').textContent=`Etapa ${i+1} de 4`;
  n('paso-anterior').disabled=i===0;
  n('paso-siguiente').textContent=i===3?'Volver a observar ↺':'Siguiente etapa →';
  if(focus)n(`titulo-paso${i}`).focus({preventScroll:true});
}
for(const tab of tabs)tab.addEventListener('click',()=>stageTo(tab.dataset.paso));
for(const heading of panels.map(s=>s.querySelector('h2')))heading.tabIndex=-1;
n('paso-anterior').addEventListener('click',()=>stageTo(current-1));
n('paso-siguiente').addEventListener('click',()=>stageTo(current===3?0:current+1));
n('registrar-prediccion').addEventListener('click',()=>{
  const picked=document.querySelector('input[name=hipotesisInicial]:checked');
  const feedback=n('prediccion-feedback');feedback.hidden=false;
  if(!picked){feedback.textContent='Selecciona una hipótesis para registrarla.';return;}
  feedback.textContent='Hipótesis registrada para esta sesión. Ahora entra en «Plegar» y contrástala con la simulación.';
});
const inputs=['observacion-final','argumento-final','volumen-final'];
function cuaderno(){
 const pred=document.querySelector('input[name=hipotesisInicial]:checked');
 return [
 'CUADERNO DE INVESTIGACIÓN · EL CUBO Y SU DESARROLLO PLANO',
 'Proyecto Geometría en tus manos · P4.5.2-C',
 'Simulación didáctica moderna. No contiene datos de estudiantes.',
 '', 'Hipótesis inicial:',pred?pred.closest('label').textContent.trim():'No registrada',
 '', 'Observaciones del plegado:',n(inputs[0]).value,
 '', 'Caras, aristas y vértices:',n(inputs[1]).value,
 '', 'Cómo varía el volumen:',n(inputs[2]).value,
 '', 'Comprueba con un cubo recortable y justifica los resultados.'
 ].join('\n');
}
function mostrarCopia(msg){n('copia-panel').hidden=false;n('texto-copiable').value=cuaderno();n('mensaje-cuaderno').textContent=msg;}
n('guardar-cuaderno').addEventListener('click',()=>{
 try{
 const blob=new Blob([cuaderno()],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=url;a.download='cuaderno_cubo_geometria.txt';document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),2000);
 n('mensaje-cuaderno').textContent='Se ha solicitado la descarga del cuaderno; comprueba el dispositivo.';
 }catch(error){mostrarCopia('No se pudo solicitar la descarga. Copia manualmente el texto inferior.');}
});
n('copiar-cuaderno').addEventListener('click',()=>{
 const text=cuaderno();
 // En navegadores que prohíben el portapapeles, el texto siempre queda visible para copia manual.
 mostrarCopia('Cuaderno preparado para copiar manualmente.');
 if(navigator.clipboard?.writeText){navigator.clipboard.writeText(text).then(()=>{n('mensaje-cuaderno').textContent='Cuaderno copiado al portapapeles.';}).catch(()=>{});}
});
n('borrar-cuaderno').addEventListener('click',()=>{for(const id of inputs)n(id).value='';n('copia-panel').hidden=true;n('texto-copiable').value='';n('mensaje-cuaderno').textContent='Notas borradas de esta sesión.';});
// Zoom de presentación sobre el sólido cuando se cierra; NO altera sus vértices matemáticos.
function zoomVisual(){
 const fraccion=Number(n('plegado').value)/100;
 const width=640-250*fraccion,height=505-195*fraccion;
 n('figura-svg').setAttribute('viewBox',`${(640-width)/2} ${(505-height)/2} ${width} ${height}`);
}
for(const id of ['abrir','mitad','cerrar'])n(id).addEventListener('click',zoomVisual);
n('plegado').addEventListener('input',zoomVisual);
stageTo(0,{focus:false});
zoomVisual();
