import {CASOS,calcularVolumen,evaluar} from './historia-datos.mjs';
'use strict';
const $ = id => document.getElementById(id);
let actual='p2';
let paso=0;
const elecciones={p2:'',p8:''};
const textos={p2:{observaciones:'',hipotesis:'',anticipo:'',revision:'',pistas:0},p8:{observaciones:'',hipotesis:'',anticipo:'',revision:'',pistas:0}};
const posters={
  p2:'ilustraciones/auditoria_escriba_p2.svg',
  p8:'ilustraciones/auditoria_escriba_p8.svg'
};
const referencias={
  p2:{documentado:'MPER N.S. 1.1, problema 2. El enunciado conservado refiere un cubo de diez pies de arista y los diagramas adjuntos utilizan otras magnitudes.',interpretado:'En el dibujo izquierdo asociado al problema, Kelly interpreta 8 × 5 × 20 pies y detecta la anotación 80, frente a 800 del producto.',pista:'Fíjate en las cifras: ¿la ilustración moderna ayuda a detectar un posible problema de cálculo? ¿Qué comprobarías en la edición científica?',datoshistoricos:'El estudio analiza varios esquemas asociados al problema 2. La atribución de magnitudes y la interpretación del resultado corresponden a la lectura académica del papiro.'},
  p8:{documentado:'MPER N.S. 1.1, problema 8. Kelly identifica dibujos de dos cubos; uno de ellos tiene una arista de seis pies.',interpretado:'El diagrama izquierdo está deteriorado y la correspondencia del dibujo derecho con el segundo cubo no puede asegurarse. Nuestro cálculo de 216 es moderno.',pista:'Si una arista mide seis pies, ¿cómo podrías calcular el volumen sin necesitar un dibujo perfectamente proporcionado?',datoshistoricos:'Los dibujos presentan pérdidas y trazos cuya interpretación no siempre es segura. La operación 6 × 6 × 6 es una aplicación escolar de la geometría actual.'}
};
function guardar(){textos[actual].observaciones=$('observaciones').value;textos[actual].hipotesis=$('hipotesis').value;textos[actual].anticipo=$('anticipo').value;textos[actual].revision=$('revision').value;}
function cambiarPaso(n,conFoco=false){
 paso=Math.max(0,Math.min(3,n));
 for(let i=0;i<4;i++){$('paso'+i).hidden=i!==paso;}
 for(const b of document.querySelectorAll('[data-paso]')){
  const on=Number(b.dataset.paso)===paso;
  b.classList.toggle('selected',on);
  if(on)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');
 }
 $('anterior').hidden=paso===0;
 $('siguiente').hidden=paso===3;
 $('estado-paso').textContent=`Paso ${paso+1} de 4`;
 if(paso===3){guardar();$('anticipo-resumen').textContent=textos[actual].anticipo.trim()||'Aún no has escrito una hipótesis inicial.';}
 if(conFoco){const h=$('titulo-paso'+paso);h.setAttribute('tabindex','-1');h.focus({preventScroll:true});h.scrollIntoView({behavior:'auto',block:'start'});}
}
function mostrarCaso(id){
 if(!Object.prototype.hasOwnProperty.call(CASOS,id))return;
 guardar();actual=id;const c=CASOS[id];const ref=referencias[id];
 document.querySelectorAll('[data-caso]').forEach(b=>{const on=b.dataset.caso===id;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
 $('contexto').textContent=c.descripcion;
 $('infografia').src=posters[id];
 $('infografia').alt=id==='p2'?'Ficha textual moderna sobre el problema 2 de Kelly y cálculo actual 8 × 5 × 20 = 800 pies cúbicos; no reproduce el papiro.':'Ficha textual moderna sobre el problema 8 de Kelly y cálculo actual 6 × 6 × 6 = 216 pies cúbicos; no reproduce el papiro.';
 $('pista').textContent=ref.pista;
 $('datos-historicos').textContent=ref.datoshistoricos;
 $('dato-documentado').textContent=ref.documentado;
 $('dato-interpretado').textContent=ref.interpretado;
 $('titulo-moderno').textContent=id==='p2'?'Ortoedro: modelo actual':'Cubo: modelo actual';
 $('modelo-historico').setAttribute('src',c.modelo);
 $('modelo-historico').setAttribute('alt',id==='p2'?'Modelo actual tridimensional de un ortoedro que sirve para el cálculo escolar.':'Modelo matemático tridimensional contemporáneo de un cubo.');
 $('alternativa-trazo').setAttribute('d',id==='p2'?'M45 45 L210 45 L210 112 L45 112 Z M45 45 L95 15 L260 15 L210 45 M210 112 L260 82 L260 15':'M80 50 L170 50 L170 125 L80 125 Z M80 50 L129 20 L219 20 L170 50 M170 125 L219 95 L219 20');
 $('rotulo-moderno').textContent=id==='p2'?'Ortoedro (esquema actual)':'Cubo (esquema actual)';
 $('medidas').textContent=c.magnitudes.join(' × ')+' '+c.unidad;
 $('operacion').textContent=c.magnitudes.join(' × ');
 $('resultado').textContent='¿?';
 $('pregunta').textContent=c.pregunta;
 $('opciones').replaceChildren();
 const legend=document.createElement('legend');legend.textContent='Selecciona tu hipótesis';$('opciones').append(legend);
 for(const op of c.opciones){const label=document.createElement('label');const inp=document.createElement('input');inp.type='radio';inp.name='respuestaHistorica';inp.value=op.id;inp.checked=elecciones[id]===op.id;inp.addEventListener('change',()=>{elecciones[id]=op.id;$('feedback').hidden=true;});label.append(inp,document.createTextNode(op.texto));$('opciones').append(label);}
 $('feedback').hidden=true;$('feedback').classList.remove('error');$('interpretacion').hidden=true;
 $('mostrar').setAttribute('aria-expanded','false');
 $('conclusion').textContent=c.explicacion;
 $('limite').textContent=c.limite;
 $('anticipo').value=textos[id].anticipo;$('revision').value=textos[id].revision;
 $('anticipo-pregunta').textContent=id==='p2'?'En nuestro modelo actual, un ortoedro mide 8 × 5 × 20 pies. ¿Qué volumen esperas obtener?':'En nuestro modelo actual, un cubo tiene 6 pies de arista. ¿Qué volumen esperas obtener?';
 document.querySelector('.taller-reto').textContent=id==='p2'?'¿80 o 800?':'¿Cuánto ocupa el cubo?';
 document.querySelector('.taller-ficha').open=false;renderPistas();
 $('observaciones').value=textos[id].observaciones;
 $('hipotesis').value=textos[id].hipotesis;
 $('aviso-descarga').textContent='';$('copia-panel').hidden=true;
 cambiarPaso(0);
}
function informe(){guardar();const c=CASOS[actual],t=textos[actual];return [
 'GEOMETRÍA EN TUS MANOS · EL TALLER DEL ESCRIBA',
 'Cuaderno personal de investigación · P4.5.2-H',
 c.titulo,
 'Testimonio: MPER N.S. 1.1, Kelly (2026), figura '+c.figura,
 'DOI: 10.1016/j.hm.2026.103248',
 'Aviso: las fichas visuales son modernas y no reproducen dibujos históricos.',
 'La operación escolar moderna no transcribe el procedimiento antiguo.','',
 'HIPÓTESIS INICIAL:',t.anticipo,'','REVISIÓN DE MI IDEA:',t.revision,'','PISTAS CONSULTADAS:',String(t.pistas),'','OBSERVACIONES:',t.observaciones,'','INTERPRETACIÓN E INCERTIDUMBRE:',t.hipotesis,'',
 'Cálculo escolar actual: '+c.magnitudes.join(' × ')+' = '+calcularVolumen(c.magnitudes)+' pies cúbicos',
 'La respuesta no se envió a servidores desde esta actividad.'
 ].join('\n');}
$('anterior').addEventListener('click',()=>cambiarPaso(paso-1,true));
$('siguiente').addEventListener('click',()=>cambiarPaso(paso+1,true));
for(const btn of document.querySelectorAll('[data-paso]'))btn.addEventListener('click',()=>cambiarPaso(Number(btn.dataset.paso),true));
for(const btn of document.querySelectorAll('[data-caso]'))btn.addEventListener('click',()=>mostrarCaso(btn.dataset.caso));
$('comprobar').addEventListener('click',()=>{
 const input=document.querySelector('input[name=respuestaHistorica]:checked');const panel=$('feedback');panel.hidden=false;
 if(!input){panel.textContent='Selecciona una respuesta para comprobarla.';panel.classList.add('error');return;}
 elecciones[actual]=input.value;const e=evaluar(actual,input.value);panel.classList.toggle('error',!e.acierto);
 panel.textContent=(e.acierto?'¡Cálculo correcto! ':'Vuelve a multiplicar las tres medidas. ')+e.explicacion;
 $('resultado').textContent=String(calcularVolumen(CASOS[actual].magnitudes))+' pies³';
});
$('mostrar').addEventListener('click',()=>{const abrir=$('interpretacion').hidden;$('interpretacion').hidden=!abrir;$('mostrar').setAttribute('aria-expanded',String(abrir));$('mostrar').textContent=abrir?'Ocultar interpretación histórica':'Leer interpretación histórica';$('resultado').textContent=String(calcularVolumen(CASOS[actual].magnitudes))+' pies³';});
$('borrar').addEventListener('click',()=>{textos[actual]={observaciones:'',hipotesis:'',anticipo:'',revision:'',pistas:0};$('anticipo').value='';$('revision').value='';$('anticipo-resumen').textContent='Aún no has escrito una hipótesis inicial.';renderPistas();$('observaciones').value='';$('hipotesis').value='';$('copia-panel').hidden=true;$('aviso-descarga').textContent='Las notas de este caso se han borrado de la página.';});
$('copiar').addEventListener('click',()=>{const t=informe();$('texto-copiable').value=t;$('copia-panel').hidden=false;
 try{if(navigator.clipboard?.writeText){navigator.clipboard.writeText(t).then(()=>$('aviso-descarga').textContent='Texto copiado. También puedes seleccionarlo en el campo inferior.').catch(()=>$('aviso-descarga').textContent='Copia manualmente el texto que aparece abajo.');}else{$('aviso-descarga').textContent='Copia manualmente el texto que aparece abajo.';}}
 catch(_){$('aviso-descarga').textContent='Copia manualmente el texto que aparece abajo.';}
});
$('exportar').addEventListener('click',()=>{const t=informe();$('texto-copiable').value=t;$('copia-panel').hidden=false;
 try{const blob=new Blob([t],{type:'text/plain;charset=utf-8'});const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download='taller_escriba_'+actual+'.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),3000);$('aviso-descarga').textContent='Descarga solicitada. Si no se guardó, copia el texto que aparece abajo.';}
 catch(_){$('aviso-descarga').textContent='No fue posible descargar. Copia manualmente el texto que aparece abajo.';}
});

const ayudas={
 p2:['El volumen de un ortoedro se calcula multiplicando sus tres dimensiones. ¿Qué unidad tendrá el resultado?', 'Calcula primero 8 × 5. Después multiplica ese resultado por 20; puedes descomponer 20 en 2 × 10.', 'Comprueba: 8 × 5 = 40; 40 × 2 = 80; falta multiplicar por 10. Este cálculo actual no demuestra cómo operó el escriba.'],
 p8:['En un cubo, las tres dimensiones son iguales. Para el volumen necesitas multiplicar la arista tres veces.', 'Calcula primero 6 × 6. Después multiplica el resultado por otro 6; puedes descomponer este último en 5 + 1.', 'Comprueba: 6 × 6 = 36; calcula 36 × 5 y suma 36. El resultado del modelo actual no reconstruye los trazos perdidos del documento.']
};
function renderPistas(){
 const lista=$('pistas-graduales'),n=textos[actual].pistas;lista.replaceChildren();
 for(const texto of ayudas[actual].slice(0,n)){const li=document.createElement('li');li.textContent=texto;lista.append(li);}
 lista.hidden=n===0;const b=$('pedir-pista');b.disabled=n===3;b.textContent=n===0?'Ver primera pista':n===3?'Has consultado las tres pistas':'Ver siguiente pista';b.setAttribute('aria-expanded',String(n>0));
}
$('pedir-pista').addEventListener('click',()=>{textos[actual].pistas=Math.min(3,textos[actual].pistas+1);renderPistas();});

const solicitado=new URLSearchParams(location.search).get('caso');mostrarCaso(Object.prototype.hasOwnProperty.call(CASOS,solicitado)?solicitado:'p2');
