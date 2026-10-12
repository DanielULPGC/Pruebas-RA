import {ESCENAS, volumenCuadrangular, volumenTriangular, resolverPregunta} from './piramides-datos.mjs';

/** Rediseño P4.5.2-P: cambia la interfaz, no el corpus histórico ni el motor matemático H2. */
const $ = id => document.getElementById(id);
const CASOS = ['grupo','p18','p19'];
const ILUSTRACIONES = {
  grupo: 'ilustraciones/piramides_triangular_didactica.svg',
  p18: 'ilustraciones/piramide_cuadrangular_didactica.svg',
  p19: 'ilustraciones/tronco_piramide_didactica.svg'
};
const INFO = {
  grupo: {
    titulo: 'El conjunto de pirámides triangulares',
    pista: 'Kelly estudia varios diagramas agrupados. La correspondencia de algunos con los problemas 10–13 es discutida; observa qué sabemos antes de atribuirlos.',
    pagina: 'Kelly (2026), figura A.4, pp. 16–17.',
    testimonio: 'MPER N.S. 1.1, problemas 10–13.',
    edicion: 'Figura A.4, edición académica de Kelly (2026).',
    modelo: 'Pirámide triangular de elaboración contemporánea.',
    descripcion: 'Pirámide triangular: una base triangular y tres caras laterales triangulares; cuatro vértices.',
    alt: 'Esquema matemático contemporáneo de pirámide triangular: una base triangular, tres caras laterales triangulares, seis aristas y cuatro vértices. Altura perpendicular al plano de la base; sin escala métrica.'
  },
  p18: {
    titulo: 'La pirámide cuadrangular del problema 18',
    pista: 'El texto trata una pirámide de base cuadrada. Kelly interpreta su dibujo como un intento de perspectiva y plantea dudas sobre el significado de un trazo interior.',
    pagina: 'Kelly (2026), figura A.8 y figuras 4–5, pp. 11 y 18–19.',
    testimonio: 'MPER N.S. 1.1, problema 18.',
    edicion: 'Figura A.8 izquierda; figura 4 (fotografía) y figura 5 (edición) del artículo.',
    modelo: 'Pirámide cuadrangular de elaboración contemporánea.',
    descripcion: 'Pirámide de base cuadrada: una base y cuatro caras triangulares, cinco vértices y ocho aristas.',
    alt: 'Esquema matemático contemporáneo de pirámide de base cuadrada: cinco caras, ocho aristas y cinco vértices. La altura interior llega al centro de la base; sin escala métrica.'
  },
  p19: {
    titulo: 'El tronco de pirámide del problema 19',
    pista: 'El dibujo representa una pirámide de base cuadrada truncada. Kelly describe marcas diagonales en la base cuyo significado exacto permanece sin aclarar.',
    pagina: 'Kelly (2026), figura A.8 derecha, pp. 18–19.',
    testimonio: 'MPER N.S. 1.1, problema 19.',
    edicion: 'Figura A.8 derecha, edición académica de Kelly (2026).',
    modelo: 'Tronco cuadrangular de elaboración contemporánea.',
    descripcion: 'Tronco de pirámide cuadrangular: dos bases cuadradas paralelas de distinto tamaño y caras laterales trapezoidales.',
    alt: 'Esquema matemático moderno de un tronco de pirámide cuadrangular recta: dos bases cuadradas paralelas, cuatro caras laterales trapezoidales y línea discontinua de altura entre los centros. Sin escala métrica.'
  }
};
let caso = 'grupo';
let paso = 0;
const notas = Object.fromEntries(CASOS.map(id => [id,{observacion:'',conclusion:'',inicial:'',revisada:'',ayudas:0,transferencia:'',criterios:[false,false,false]}]));
const respuestas = Object.fromEntries(CASOS.map(id => [id,'']));
const medidasGuardadas = Object.fromEntries(CASOS.map(id => [id,null]));
const progreso = Object.fromEntries(CASOS.map(id => [id,{feedback:'',error:false,argumento:false,calculo:'',prisma:''}]));

function guardarNotas() {
  notas[caso].observacion = $('observacion').value;
  notas[caso].conclusion = $('conclusion').value;
  notas[caso].inicial=$('idea-inicial').value;notas[caso].revisada=$('idea-revisada').value;
  notas[caso].transferencia=$('respuesta-transferencia').value;notas[caso].criterios=[0,1,2].map(i=>$('criterio-'+i).checked);
  const controles = [...$('medidas').querySelectorAll('input')];
  if (controles.length) medidasGuardadas[caso] = Object.fromEntries(controles.map(x => [x.id,x.value]));
}
function mostrarPaso(numero, moverFoco = false) {
  paso = Math.max(0,Math.min(3,numero));
  for(let i=0;i<4;i++) $('paso'+i).hidden = i!==paso;
  document.querySelectorAll('[data-paso]').forEach(b => {
    const activo = Number(b.dataset.paso)===paso;
    b.classList.toggle('selected',activo);
    if(activo) b.setAttribute('aria-current','step'); else b.removeAttribute('aria-current');
  });
  $('anterior').disabled = paso===0;
  $('siguiente').disabled = paso===3;
  $('indicador-paso').textContent = `Paso ${paso+1} de 4`;
  if(paso===3){guardarNotas();$('idea-resumen').textContent=notas[caso].inicial.trim()||'Aún no has escrito una idea inicial.';}
  if(moverFoco){ const h=$('titulo-paso'+paso); h.tabIndex=-1;h.focus({preventScroll:true}); h.scrollIntoView({block:'start',behavior:'instant'}); }
}
function mostrarCaso(id) {
  if (!Object.hasOwn(ESCENAS,id)) return;
  guardarNotas();
  caso=id;
  const e=ESCENAS[id], inf=INFO[id], ev=progreso[id];
  document.querySelectorAll('[data-caso]').forEach(b => {
    const activo=b.dataset.caso===id;
    b.classList.toggle('selected',activo);
    b.setAttribute('aria-pressed',String(activo));
  });
  $('contexto').textContent=e.contexto;
  $('infografia').src=ILUSTRACIONES[id]; $('infografia').alt=inf.alt;
  $('enlace-ampliar-figura').href=ILUSTRACIONES[id];
  $('pista').textContent=inf.pista; $('referencia-caso').textContent=inf.pagina;
  $('fuente-titulo').textContent=inf.titulo;
  $('dato-historico').textContent=e.contexto;
  $('doc-testimonio').textContent=inf.testimonio;
  $('doc-edicion').textContent=inf.edicion;
  $('doc-limite').textContent=e.incertidumbre;
  $('tit-modelo').textContent=inf.modelo;
  $('visor-piramide').setAttribute('src',e.modelo);
  $('visor-piramide').setAttribute('alt',inf.descripcion);
  $('alternativa').textContent=inf.descripcion;
  $('pregunta').textContent=e.pregunta;
  const opciones=$('opciones');opciones.replaceChildren();
  const legend=document.createElement('legend');legend.textContent='Selecciona la explicación más rigurosa';opciones.append(legend);
  for(const op of e.opciones){
    const lab=document.createElement('label'); const radio=document.createElement('input');
    radio.type='radio'; radio.name='preguntaHistorica';radio.value=op.id;
    radio.checked=respuestas[id]===op.id;
    radio.addEventListener('change',()=>{respuestas[id]=op.id;ev.feedback='';$('feedback').hidden=true});
    lab.append(radio,document.createTextNode(op.texto));opciones.append(lab);
  }
  $('feedback').hidden=!ev.feedback;$('feedback').textContent=ev.feedback;$('feedback').classList.toggle('error',ev.error);
  $('texto-argumento').textContent=e.incertidumbre;
  $('argumento').hidden=!ev.argumento;$('mostrar-argumento').setAttribute('aria-expanded',String(ev.argumento));
  $('grupo-calc').hidden=id==='p19'; $('corte-info').hidden=id!=='p19';
  const medidas=$('medidas');medidas.replaceChildren();
  const defs=id==='grupo' ? [
    ['base','Base del triángulo (cm)',6],
    ['altura-base','Altura del triángulo (cm)',4],
    ['altura-piramide','Altura perpendicular de la pirámide (cm)',9]
  ] : id==='p18' ? [
    ['lado','Lado de la base cuadrada (cm)',6],
    ['altura-piramide','Altura perpendicular de la pirámide (cm)',9]
  ] : [];
  for(const [clave,label,valor] of defs){
    const lab=document.createElement('label');lab.textContent=label;
    const input=document.createElement('input');input.id='m-'+clave;
    input.type='number';input.min='0.1';input.max='100000';input.step='any';
    input.value=medidasGuardadas[id]?.[input.id]??String(valor);input.dataset.default=String(valor);
    input.addEventListener('input',()=>{
      $('calculo-respuesta').textContent='Pulsa «Calcular volumen» para comprobar las nuevas medidas.';
      $('calculo-respuesta').classList.remove('error');$('comparacion-prisma').textContent='';
      ev.calculo='';ev.prisma='';actualizarEsquema();
    });lab.append(input);medidas.append(lab);
  }
  $('calculo-respuesta').textContent=ev.calculo||'Introduce las medidas y calcula el volumen.';
  $('calculo-respuesta').classList.toggle('error',ev.calculo.startsWith('Error:'));
  $('comparacion-prisma').textContent=ev.prisma;
  $('idea-inicial').value=notas[id].inicial;$('idea-revisada').value=notas[id].revisada;$('pregunta-inicial').textContent=ANTICIPOS[id];mostrarAyudas();
  $('respuesta-transferencia').value=notas[id].transferencia;[0,1,2].forEach(i=>$('criterio-'+i).checked=notas[id].criterios[i]);$('situacion-nueva').textContent=TRANSFERENCIA[id].pregunta;$('orientacion-transferencia').textContent=TRANSFERENCIA[id].guia;$('guia-transferencia').open=false;
  actualizarEsquema();
  $('observacion').value=notas[id].observacion;$('conclusion').value=notas[id].conclusion;
  $('mensaje-descarga').textContent='';$('copia-panel').hidden=true;
  mostrarPaso(0);
}
function comprobar(){
  const input=document.querySelector('input[name="preguntaHistorica"]:checked');
  const panel=$('feedback');panel.hidden=false;
  if(!input){panel.textContent='Selecciona primero una respuesta.';panel.classList.add('error');progreso[caso].feedback=panel.textContent;progreso[caso].error=true;return;}
  const r=resolverPregunta(caso,input.value);
  panel.textContent=(r.correcta?'¡Interpretación justificada! ':'Revisa la evidencia. ')+r.explicacion;
  panel.classList.toggle('error',!r.correcta);
  progreso[caso].feedback=panel.textContent;progreso[caso].error=!r.correcta;
}
function calcular(){
  actualizarEsquema();
  if(caso==='p19')return;
  const informe=$('calculo-respuesta'); const resumen=$('comparacion-prisma');
  try {
    const num=id => {const el=$('m-'+id);if(!el || !el.value.trim()) throw Error('Falta una medida.');
      const n=Number(el.value);if(!Number.isFinite(n)||n<=0||n>100000)throw Error('Introduce números positivos no superiores a 100000.');return n;};
    let base,altura,volumen;
    if(caso==='grupo'){const b=num('base'),hbase=num('altura-base');altura=num('altura-piramide');base=b*hbase/2;volumen=volumenTriangular(b,hbase,altura);}
    else{const l=num('lado');altura=num('altura-piramide');base=l*l;volumen=volumenCuadrangular(l,altura);}
    const mostrar=n=>Number(n.toPrecision(10)).toLocaleString('es-ES',{maximumFractionDigits:8});
    informe.classList.remove('error'); informe.textContent=`Área de la base: ${mostrar(base)} cm². Volumen: ${mostrar(base)} × ${mostrar(altura)} ÷ 3 = ${mostrar(volumen)} cm³.`;
    resumen.textContent=`Un prisma con igual base y altura ocuparía ${mostrar(base*altura)} cm³: tres veces el volumen de esta pirámide.`;
    progreso[caso].calculo=informe.textContent; progreso[caso].prisma=resumen.textContent;
  }catch(e){informe.classList.add('error');informe.textContent='Error: '+e.message;resumen.textContent='';progreso[caso].calculo=informe.textContent;progreso[caso].prisma='';}
}
function cuaderno(){
  guardarNotas();const e=ESCENAS[caso], n=notas[caso];
  return ['GEOMETRÍA EN TUS MANOS — LAS PIRÁMIDES DEL PAPIRO',
    'P4.5.2-P · Cuaderno escolar',`Caso: ${e.titulo}`,
    `Estudio: Kelly (2026), figura ${e.figura}, doi:10.1016/j.hm.2026.103248`,
    'Los dibujos e ilustraciones digitales son contemporáneos; NO son el papiro.',
    '', 'IDEA INICIAL:',n.inicial,'','REVISIÓN DE MI IDEA:',n.revisada,'','RETO DE TRANSFERENCIA:',TRANSFERENCIA[caso].pregunta,n.transferencia,'','AUTOEVALUACIÓN DEL ALUMNADO (NO CALIFICACIÓN):',n.criterios.map((v,i)=>(v?'Marcado: ':'Sin marcar: ')+CRITERIOS[i]).join('\n'),'','PISTAS CONSULTADAS:',String(n.ayudas),'','OBSERVACIÓN:',n.observacion,'','CONCLUSIÓN / LÍMITES:',n.conclusion,'',
    'Datos matemáticos de la calculadora: ejemplos escolares, no valores originales.',
    'P5 NO-GO: no se han acreditado ensayos físicos de RA.'].join('\n');
}
function descargar(){
  const texto=cuaderno();
  try {const url=URL.createObjectURL(new Blob(['\uFEFF'+texto],{type:'text/plain;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download='cuaderno_piramides_'+caso+'.txt';document.body.append(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),3000);
    $('mensaje-descarga').textContent='Se ha solicitado la descarga. Si no aparece, utiliza «Mostrar texto para copiar».';
  }catch(e){$('mensaje-descarga').textContent='No fue posible iniciar la descarga. Usa «Mostrar texto para copiar».';}
}
function textoCopiable(){const t=$('texto-copiable');t.value=cuaderno();$('copia-panel').hidden=false;t.focus();t.select();$('mensaje-descarga').textContent='Puedes copiar el texto seleccionado y guardarlo en tu dispositivo.';}

for(const b of document.querySelectorAll('[data-caso]'))b.addEventListener('click',()=>mostrarCaso(b.dataset.caso));
for(const b of document.querySelectorAll('[data-paso]'))b.addEventListener('click',()=>mostrarPaso(Number(b.dataset.paso),true));
$('anterior').addEventListener('click',()=>mostrarPaso(paso-1,true));
$('siguiente').addEventListener('click',()=>mostrarPaso(paso+1,true));
$('verificar').addEventListener('click',comprobar);
$('mostrar-argumento').addEventListener('click',()=>{const abrir=$('argumento').hidden;$('argumento').hidden=!abrir;$('mostrar-argumento').setAttribute('aria-expanded',String(abrir));progreso[caso].argumento=abrir;});
$('calcular').addEventListener('click',calcular);
$('reset-medidas').addEventListener('click',()=>{$('medidas').querySelectorAll('input').forEach(e=>e.value=e.dataset.default);calcular()});
$('descargar').addEventListener('click',descargar);
$('mostrar-texto').addEventListener('click',textoCopiable);
$('borrar').addEventListener('click',()=>{notas[caso]={observacion:'',conclusion:'',inicial:'',revisada:'',ayudas:0,transferencia:'',criterios:[false,false,false]};$('respuesta-transferencia').value='';[0,1,2].forEach(i=>$('criterio-'+i).checked=false);$('guia-transferencia').open=false;$('idea-inicial').value='';$('idea-revisada').value='';$('idea-resumen').textContent='Aún no has escrito una idea inicial.';mostrarAyudas();$('observacion').value='';$('conclusion').value='';$('mensaje-descarga').textContent='Las notas de este caso se han borrado.';$('copia-panel').hidden=true;});

const ANTICIPOS={
 grupo:'¿Un dibujo por sí solo permite identificar con certeza el problema antiguo al que pertenece? ¿Qué más necesitarías?',
 p18:'¿La altura de una pirámide es igual a una arista inclinada? ¿Cómo podrías distinguirlas?',
 p19:'Si cortamos una pirámide con un plano paralelo a la base y retiramos la punta, ¿qué cambia en sus caras y bases?'
};
const PISTAS={
 grupo:['Distingue lo que se ve en un dibujo de la interpretación de quien lo estudia.', 'Busca qué correspondencias presenta el estudio como seguras y cuáles como propuestas.', 'Que varios dibujos formen un conjunto no demuestra una correspondencia exacta para cada uno. Tu explicación debe conservar las dudas del estudio.'],
 p18:['Localiza el vértice y el plano de la base en el modelo actual.', 'Compara un segmento perpendicular a la base con una arista inclinada: no cumplen la misma función.', 'Para calcular el volumen moderno necesitas la distancia perpendicular al plano de la base. Esto no identifica por sí solo un trazo del papiro.'],
 p19:['Imagina el corte paralelo a la base y observa la parte que queda después de retirar la punta.', 'Compara la superficie del corte con la base original. ¿Son paralelas? ¿Tienen el mismo tamaño?', 'En el tronco que estudiamos quedan dos bases paralelas, semejantes y de distinto tamaño. Esta propiedad geométrica no explica las marcas inciertas del documento.']
};
function mostrarAyudas(){
 const n=notas[caso].ayudas,lista=$('ayudas');lista.replaceChildren();
 for(const texto of PISTAS[caso].slice(0,n)){const li=document.createElement('li');li.textContent=texto;lista.append(li);}
 lista.hidden=n===0;const b=$('pedir-ayuda');b.disabled=n===3;b.setAttribute('aria-expanded',String(n>0));b.textContent=n===0?'Ver primera pista':n===3?'Has consultado las tres pistas':'Ver siguiente pista';
}
$('pedir-ayuda').addEventListener('click',()=>{notas[caso].ayudas=Math.min(3,notas[caso].ayudas+1);mostrarAyudas();});


function actualizarEsquema(){
 const panel=$('experimento-visual');panel.hidden=caso!=='p18';if(caso!=='p18')return;
 const a=Number($('m-lado').value),h=Number($('m-altura-piramide').value),svg=$('esquema-medidas'),grupo=$('dibujo-medidas');grupo.replaceChildren();
 if(!Number.isFinite(a)||!Number.isFinite(h)||a<=0||h<=0||a>100000||h>100000){svg.hidden=true;$('estado-esquema').textContent='Para representar la figura, introduce dos medidas positivas no superiores a 100000.';return;}
 svg.hidden=false;const escala=Math.min(110/Math.max(a,6),125/Math.max(h,9));
 const crear=(tipo,atributos,texto)=>{const el=document.createElementNS('http://www.w3.org/2000/svg',tipo);for(const [k,v] of Object.entries(atributos))el.setAttribute(k,String(v));if(texto)el.textContent=texto;grupo.append(el);};
 for(const [x,lado,altura,titulo] of [[90,6,9,'Referencia'],[270,a,h,'Tus medidas']]){
  const b=lado*escala/2,z=lado*escala*.18,y=210,t=y-altura*escala;
  crear('text',{x,y:28,'text-anchor':'middle',fill:'#253c40','font-size':16},titulo);
  crear('polygon',{points:`${x},${t} ${x-b},${y} ${x},${y+z}`,fill:'#efc27e',stroke:'#815021','stroke-width':2});
  crear('polygon',{points:`${x},${t} ${x},${y+z} ${x+b},${y}`,fill:'#d8a463',stroke:'#815021','stroke-width':2});
  crear('path',{d:`M${x-b} ${y}L${x} ${y-z}L${x+b} ${y}M${x} ${y-z}L${x} ${t}`,fill:'none',stroke:'#815021','stroke-dasharray':'4 4'});
  crear('path',{d:`M${x} ${t}V${y}`,fill:'none',stroke:'#174b49','stroke-width':3,'stroke-dasharray':'5 4'});
  crear('circle',{cx:x,cy:y,r:3,fill:'#174b49'});
  crear('text',{x,y:250,'text-anchor':'middle',fill:'#253c40','font-size':13},`lado ${lado} cm; h ${altura} cm`);
 }
 const volumen=volumenCuadrangular(a,h),ratio=volumen/108;
 $('descripcion-esquema').textContent=`Comparación de pirámides de base cuadrada. Referencia: lado 6 y altura 9 cm. Tus medidas: lado ${a} y altura perpendicular ${h} cm. Las alturas se marcan con líneas discontinuas.`;
 $('estado-esquema').textContent=`Volumen de referencia: 108 cm³. Con tus medidas: ${Number(volumen.toPrecision(8)).toLocaleString('es-ES')} cm³; ${Number(ratio.toPrecision(8)).toLocaleString('es-ES')} veces el volumen de referencia.`;
}
for(const [id,campo] of [['doblar-altura','m-altura-piramide'],['doblar-base','m-lado']])$(id).addEventListener('click',()=>{
 if(caso!=='p18')return;const input=$(campo),n=Number(input.value);
 if(!Number.isFinite(n)||n<=0||n>50000){$('estado-esquema').textContent='Para duplicar esta medida, introduce un valor positivo no superior a 50000.';return;}
 input.value=String(n*2);calcular();
});


const CRITERIOS=['Idea clara','Prueba o razonamiento que la sostiene','Distinción entre modelo actual y fuente histórica'];
const TRANSFERENCIA={
 grupo:{pregunta:'Situación inventada: encuentras un dibujo de una pirámide sin texto, fecha ni procedencia. ¿Puedes asignarlo con certeza a uno de los problemas del papiro? Explica qué información necesitarías.',guia:'La semejanza de forma no demuestra la procedencia ni permite asignar con certeza un problema. Necesitarías documentación del origen, contexto y comparación con la edición científica. Puedes describir la figura sin inventar su atribución.'},
 p18:{pregunta:'Nuevo ejemplo escolar: una pirámide de base cuadrada tiene lado 4 cm y altura perpendicular 6 cm. Sin cambiar la base, la altura pasa a 12 cm. Predice qué ocurre con el volumen y compruébalo. ¿Este resultado explica cómo calculó un escriba antiguo?',guia:'El volumen inicial es (4 × 4 × 6) / 3 = 32 cm³. Con altura 12 cm es 64 cm³: se duplica. Es un cálculo matemático actual; por sí solo no documenta un procedimiento antiguo.'},
 p19:{pregunta:'Nuevo ejemplo geométrico: cortas una pirámide con un plano inclinado respecto de su base y retiras la punta. ¿Puedes afirmar que la nueva cara superior es paralela a la base y semejante a ella? Explica qué condición del caso anterior ha cambiado.',guia:'El corte ya no es paralelo a la base. La nueva cara está en un plano inclinado, por lo que no es paralela a la base; tampoco puedes asegurar la semejanza. Las propiedades del tronco estudiado dependían del corte paralelo. Este ejemplo no interpreta las marcas del papiro.'}
};

mostrarCaso(new URLSearchParams(location.search).get('caso') in ESCENAS ? new URLSearchParams(location.search).get('caso') : 'grupo');
