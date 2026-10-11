import {CASOS,calcularVolumen,evaluar} from './historia-datos.mjs';
'use strict';
const $ = id => document.getElementById(id);
let actual='p2';
let paso=0;
const elecciones={p2:'',p8:''};
const textos={p2:{observaciones:'',hipotesis:''},p8:{observaciones:'',hipotesis:''}};
const posters={
  p2:'ilustraciones/volumen_p2_ia.webp',
  p8:'ilustraciones/cubo_p8_ia.webp'
};
const referencias={
  p2:{documentado:'MPER N.S. 1.1, problema 2. El enunciado conservado refiere un cubo de diez pies de arista y los diagramas adjuntos utilizan otras magnitudes.',interpretado:'En el dibujo izquierdo asociado al problema, Kelly interpreta 8 × 5 × 20 pies y detecta la anotación 80, frente a 800 del producto.',pista:'Fíjate en las cifras: ¿la ilustración moderna ayuda a detectar un posible problema de cálculo? ¿Qué comprobarías en la edición científica?',datoshistoricos:'El estudio analiza varios esquemas asociados al problema 2. La atribución de magnitudes y la interpretación del resultado corresponden a la lectura académica del papiro.'},
  p8:{documentado:'MPER N.S. 1.1, problema 8. Kelly identifica dibujos de dos cubos; uno de ellos tiene una arista de seis pies.',interpretado:'El diagrama izquierdo está deteriorado y la correspondencia del dibujo derecho con el segundo cubo no puede asegurarse. Nuestro cálculo de 216 es moderno.',pista:'Si una arista mide seis pies, ¿cómo podrías calcular el volumen sin necesitar un dibujo perfectamente proporcionado?',datoshistoricos:'Los dibujos presentan pérdidas y trazos cuya interpretación no siempre es segura. La operación 6 × 6 × 6 es una aplicación escolar de la geometría actual.'}
};
function guardar(){textos[actual].observaciones=$('observaciones').value;textos[actual].hipotesis=$('hipotesis').value;}
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
 if(conFoco){const h=$('titulo-paso'+paso);h.setAttribute('tabindex','-1');h.focus({preventScroll:true});h.scrollIntoView({behavior:'auto',block:'start'});}
}
function mostrarCaso(id){
 if(!Object.prototype.hasOwnProperty.call(CASOS,id))return;
 guardar();actual=id;const c=CASOS[id];const ref=referencias[id];
 document.querySelectorAll('[data-caso]').forEach(b=>{const on=b.dataset.caso===id;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
 $('contexto').textContent=c.descripcion;
 $('infografia').src=posters[id];
 $('infografia').alt=id==='p2'?'Infografía moderna generada mediante IA con un dibujo conceptual de un ortoedro y el cálculo 8 × 5 × 20 = 800; no reproduce el papiro.':'Infografía moderna generada mediante IA con dibujos conceptuales de un cubo y el cálculo 6 × 6 × 6 = 216; no reproduce el papiro.';
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
 'Aviso: las ilustraciones del taller fueron generadas mediante IA y no son documentos históricos.',
 'La operación escolar moderna no transcribe el procedimiento antiguo.','',
 'OBSERVACIONES:',t.observaciones,'','INTERPRETACIÓN E INCERTIDUMBRE:',t.hipotesis,'',
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
$('borrar').addEventListener('click',()=>{textos[actual]={observaciones:'',hipotesis:''};$('observaciones').value='';$('hipotesis').value='';$('copia-panel').hidden=true;$('aviso-descarga').textContent='Las notas de este caso se han borrado de la página.';});
$('copiar').addEventListener('click',()=>{const t=informe();$('texto-copiable').value=t;$('copia-panel').hidden=false;
 try{if(navigator.clipboard?.writeText){navigator.clipboard.writeText(t).then(()=>$('aviso-descarga').textContent='Texto copiado. También puedes seleccionarlo en el campo inferior.').catch(()=>$('aviso-descarga').textContent='Copia manualmente el texto que aparece abajo.');}else{$('aviso-descarga').textContent='Copia manualmente el texto que aparece abajo.';}}
 catch(_){$('aviso-descarga').textContent='Copia manualmente el texto que aparece abajo.';}
});
$('exportar').addEventListener('click',()=>{const t=informe();$('texto-copiable').value=t;$('copia-panel').hidden=false;
 try{const blob=new Blob([t],{type:'text/plain;charset=utf-8'});const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download='taller_escriba_'+actual+'.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),3000);$('aviso-descarga').textContent='Descarga solicitada. Si no se guardó, copia el texto que aparece abajo.';}
 catch(_){$('aviso-descarga').textContent='No fue posible descargar. Copia manualmente el texto que aparece abajo.';}
});
const solicitado=new URLSearchParams(location.search).get('caso');mostrarCaso(Object.prototype.hasOwnProperty.call(CASOS,solicitado)?solicitado:'p2');
