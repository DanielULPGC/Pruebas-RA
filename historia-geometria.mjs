import {CASOS,calcularVolumen,evaluar} from './historia-datos.mjs';
let actual='p2';
const $=id=>document.getElementById(id);
let elecciones={p2:'',p8:''};
const escritos={p2:{observaciones:'',hipotesis:''},p8:{observaciones:'',hipotesis:''}};
function guardarTexto(){escritos[actual].observaciones=$('observaciones').value;escritos[actual].hipotesis=$('hipotesis').value;}
function mostrarCaso(id){if(!(id in CASOS))return;guardarTexto();actual=id;const c=CASOS[id];for(const b of document.querySelectorAll('[data-caso]')){b.setAttribute('aria-pressed',String(b.dataset.caso===id));}
$('titulo-fuente').textContent=`MPER N.S. 1.1 · ${c.figura}`;$('contexto').textContent=c.descripcion;
$('papiro').src=c.diagrama;$('papiro').alt=c.alt;
$('credito').textContent=`Kelly (2026), fig. ${c.figura}, p. 15, licencia CC BY 4.0. Edición moderna, no fotografía directa del papiro.`;
$('modelo-historico').setAttribute('src',c.modelo);
$('modelo-historico').setAttribute('alt',id==='p2'?'Ortoedro contemporáneo con proporciones matemáticas de 8 por 5 por 20.':'Cubo tridimensional contemporáneo: tres aristas iguales.');
$('titulo-moderno').textContent=id==='p2'?'Ortoedro · proporciones 8 : 5 : 20':'Cubo · tres aristas de 6';
$('rotulo-moderno').textContent=id==='p2'?'Ortoedro matemático: 8 × 5 × 20':'Cubo: 6 × 6 × 6';
const svg=document.querySelector('.fallback-diagrama');svg.setAttribute('aria-label',id==='p2'?'Esquema moderno alternativo de ortoedro con tres dimensiones distintas.':'Esquema moderno alternativo de un cubo de aristas iguales.');
svg.querySelector('path').setAttribute('d',id==='p2'?'M45 45 L210 45 L210 112 L45 112 Z M45 45 L95 15 L260 15 L210 45 M210 112 L260 82 L260 15':'M80 50 L170 50 L170 130 L80 130 Z M80 50 L129 20 L219 20 L170 50 M170 130 L219 100 L219 20');
$('medidas').textContent=c.magnitudes.join(' × ')+' '+c.unidad;$('operacion').textContent=c.magnitudes.join(' × ');$('resultado').textContent='¿?';$('pregunta').textContent=c.pregunta;
$('opciones').replaceChildren();const legend=document.createElement('legend');legend.textContent='Elige una respuesta';$('opciones').append(legend);
for(const op of c.opciones){const label=document.createElement('label');const input=document.createElement('input');input.type='radio';input.name='respuestaHistorica';input.value=op.id;if(elecciones[id]===op.id)input.checked=true;input.addEventListener('change',()=>{elecciones[id]=op.id;$('feedback').hidden=true;});label.append(input,document.createTextNode(op.texto));$('opciones').append(label);}
$('feedback').hidden=true;$('feedback').classList.remove('error');$('interpretacion').hidden=true;$('conclusion').textContent=c.explicacion;$('limite').textContent=c.limite;
$('observaciones').value=escritos[id].observaciones;$('hipotesis').value=escritos[id].hipotesis;$('aviso-descarga').textContent='';}
for(const b of document.querySelectorAll('[data-caso]'))b.addEventListener('click',()=>mostrarCaso(b.dataset.caso));
$('comprobar').addEventListener('click',()=>{const answer=document.querySelector('input[name=respuestaHistorica]:checked');const panel=$('feedback');panel.hidden=false;if(!answer){panel.classList.add('error');panel.textContent='Selecciona primero una respuesta.';return;}const val=evaluar(actual,answer.value);panel.classList.toggle('error',!val.acierto);panel.textContent=(val.acierto?'Correcto. ':'Revisa las tres dimensiones. ')+val.explicacion;$('resultado').textContent=String(calcularVolumen(CASOS[actual].magnitudes));});
$('mostrar').addEventListener('click',()=>{$('interpretacion').hidden=false;$('resultado').textContent=String(calcularVolumen(CASOS[actual].magnitudes));});
$('borrar').addEventListener('click',()=>{escritos[actual]={observaciones:'',hipotesis:''};$('observaciones').value='';$('hipotesis').value='';$('aviso-descarga').textContent='Las notas de este caso se han borrado.';});
$('exportar').addEventListener('click',()=>{guardarTexto();const c=CASOS[actual], e=escritos[actual];const t=['CUADERNO DE INVESTIGACIÓN · P4.4-H1',c.titulo,'Fuente: Kelly (2026), Historia Mathematica 75, 103248, '+c.figura,'','Comparación de representaciones:',e.observaciones,'','Hechos e hipótesis:',e.hipotesis,'','Nota: Respuestas de elaboración propia; no se envían desde la página.'].join('\n');try{const blob=new Blob([t],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='investigacion_geometria_'+actual+'.txt';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);$('aviso-descarga').textContent='Se ha solicitado la descarga del archivo TXT en este dispositivo.';}catch(e){$('aviso-descarga').textContent='No fue posible solicitar la descarga. Puedes copiar manualmente tus notas.';}});
const solicitado=new URLSearchParams(location.search).get('caso');mostrarCaso(solicitado in CASOS?solicitado:'p2');
