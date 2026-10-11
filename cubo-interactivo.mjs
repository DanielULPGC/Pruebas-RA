import {CARAS,carasEn,proyeccion,profundidad,TOPOLOGIA,carasOpuestas,superficie,volumen} from './geometria-cubo.mjs';
const $=(id)=>document.getElementById(id),NS='http://www.w3.org/2000/svg';
let avance=0,vista='planta',modo='cara',seleccionCara='A',indice=0;
const dibujo=$('dibujo-cubo');
const nuevo=(tag,attrs={})=>{const n=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));return n};
function refrescar(){
 const caras=carasEn(avance);dibujo.replaceChildren();
 const orden=caras.slice().sort((a,b)=>{
  const da=a.vertices.reduce((s,p)=>s+profundidad(p,vista),0)/4;
  const db=b.vertices.reduce((s,p)=>s+profundidad(p,vista),0)/4;
  return da-db;
 });
 for(const cara of orden){
   const g=nuevo('g',{class:'cara-svg',role:'button',tabindex:'0','aria-label':`Seleccionar cara ${cara.id}. ${cara.nombre}`});
   const points=cara.vertices.map(p=>proyeccion(p,vista).map(x=>x.toFixed(2)).join(',')).join(' ');
   const activa=modo==='cara'&&seleccionCara===cara.id;
   const poly=nuevo('polygon',{points,fill:cara.color,stroke:activa?'#0a5e76':'#54717b','stroke-width':activa?5:2.3,'stroke-linejoin':'round','fill-opacity':'1'});
   const media=cara.vertices.reduce((s,p)=>s.map((v,i)=>v+p[i]/4),[0,0,0]);const [cx,cy]=proyeccion(media,vista);
   const txt=nuevo('text',{x:cx,y:cy+6,'font-size':'21','text-anchor':'middle','font-weight':'800',fill:'#173649','pointer-events':'none'});txt.textContent=cara.id;
   g.append(poly,txt);
   g.addEventListener('click',()=>{modo='cara';seleccionCara=cara.id;sync()});
   g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();modo='cara';seleccionCara=cara.id;sync()}});
   dibujo.append(g);
 }
 if(modo==='arista'){
   const ar=TOPOLOGIA.aristas[indice];const c=caras.find(f=>f.id===ar.panel);
   const a=proyeccion(c.vertices[ar.desde],vista),b=proyeccion(c.vertices[ar.hasta],vista);
   dibujo.append(nuevo('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:'white','stroke-width':13,'stroke-linecap':'round','pointer-events':'none'}));
   dibujo.append(nuevo('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:'#ba4c17','stroke-width':7,'stroke-linecap':'round','pointer-events':'none'}));
 }
 if(modo==='vertice'){
   const v=TOPOLOGIA.vertices[indice],c=caras.find(f=>f.id===v.panel),p=proyeccion(c.vertices[v.indice],vista);
   dibujo.append(nuevo('circle',{cx:p[0],cy:p[1],r:14,fill:'white','pointer-events':'none'}));
   dibujo.append(nuevo('circle',{cx:p[0],cy:p[1],r:9,fill:'#b84f20',stroke:'#792709','stroke-width':2,'pointer-events':'none'}));
 }
 $('valor-plegado').textContent=`${Math.round(avance*100)} %`;
 $('estado-plegado').textContent=avance===0?'Desplegado':avance===1?'Cubo cerrado':'Plegado parcial';
 $('figura-svg').setAttribute('aria-label',avance===0?'Desarrollo plano de seis cuadrados congruentes.':avance===1?'Cubo cerrado construido a partir de seis cuadrados.':'Plegado intermedio de un desarrollo de cubo.');
 $('detalle-matematico').textContent=avance===0?'Los seis cuadrados forman un desarrollo plano válido. Las cinco uniones son bisagras.':avance===1?'El plegado de 90° en las cinco bisagras produce un cubo cerrado: seis caras, doce aristas y ocho vértices.':'Representación del plegado parcial. Las caras conservan su forma cuadrada y no se deforman.';
}
function sync(){
 document.querySelectorAll('[data-modo]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.modo===modo)));
 $('selector-caras').hidden=modo!=='cara';$('recorrer').hidden=modo==='cara';
 document.querySelectorAll('[data-cara]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.cara===seleccionCara)));
 $('vista-planta').setAttribute('aria-pressed',String(vista==='planta'));
 $('vista-3d').setAttribute('aria-pressed',String(vista==='perspectiva'));
 if(modo==='cara'){
  const c=CARAS.find(c=>c.id===seleccionCara);
  $('seleccion-titulo').textContent=`Cara ${c.id}`;
  const descripciones={A:'Cara central del desarrollo. Permanece fija y se convierte en una de las bases del cubo.',B:'Cara de la izquierda. Al cerrar el cubo queda opuesta a la cara C.',C:'Cara de la derecha. Al cerrar el cubo queda opuesta a la cara B.',D:'Cara que aparece inmediatamente por encima de A en el desarrollo. Al cerrar queda opuesta a E.',E:'Cara que aparece debajo de A en el desarrollo. Al cerrar queda opuesta a D.',F:'Cara más alejada de A en el desarrollo. Al cerrar el cubo queda opuesta a A.'};
  $('seleccion-descripcion').textContent=descripciones[c.id];
 } else {
  const cuenta=modo==='arista'?TOPOLOGIA.aristas.length:TOPOLOGIA.vertices.length;
  $('indice-elemento').textContent=`${indice+1} / ${cuenta}`;
  $('seleccion-titulo').textContent=(modo==='arista'?'Arista':'Vértice')+' '+(indice+1);
  $('seleccion-descripcion').textContent=modo==='arista'?'Segmento común a dos caras cuando el cubo está cerrado. Su longitud equivale a una arista del cubo.':'Punto de encuentro de tres caras cuando el cubo está cerrado.';
 }
 refrescar();
}
$('plegado').addEventListener('input',e=>{avance=Number(e.target.value)/100;if(avance>0&&vista==='planta')vista='perspectiva';sync()});
$('abrir').addEventListener('click',()=>{avance=0;vista='planta';$('plegado').value=0;sync()});
$('mitad').addEventListener('click',()=>{avance=.5;vista='perspectiva';$('plegado').value=50;sync()});
$('cerrar').addEventListener('click',()=>{avance=1;vista='perspectiva';$('plegado').value=100;sync()});
$('vista-planta').addEventListener('click',()=>{vista='planta';sync()});
$('vista-3d').addEventListener('click',()=>{vista='perspectiva';sync()});
document.querySelectorAll('[data-modo]').forEach(b=>b.addEventListener('click',()=>{modo=b.dataset.modo;indice=0;sync()}));
document.querySelectorAll('[data-cara]').forEach(b=>b.addEventListener('click',()=>{seleccionCara=b.dataset.cara;sync()}));
$('anterior').addEventListener('click',()=>{let n=modo==='arista'?12:8;indice=(indice+n-1)%n;sync()});
$('siguiente').addEventListener('click',()=>{let n=modo==='arista'?12:8;indice=(indice+1)%n;sync()});
$('comprobar-opuesta').addEventListener('click',()=>{
 const valor=$('opuesta').value,fb=$('feedback-opuesta');fb.className='feedback';
 if(!valor){fb.textContent='Selecciona una respuesta antes de comprobarla.';return}
 if(valor===carasOpuestas().A){fb.textContent='Correcto. La cara F, situada al final del desarrollo, se pliega hasta quedar paralela y enfrente de A.';fb.classList.add('acierto')}
 else{fb.textContent='Revisa el plegado completo: identifica qué cara no comparte arista con A y queda directamente enfrente.';fb.classList.add('revisar')}
});
$('comprobar-volumen').addEventListener('click',()=>{
 const valor=$('multiplicador').value,fb=$('feedback-volumen');fb.className='feedback';
 if(!valor){fb.textContent='Elige primero una predicción.';return}
 if(valor==='8'){fb.textContent='Correcto: (2a)³ = 2³ × a³ = 8a³. El volumen es ocho veces mayor.';fb.classList.add('acierto')}
 else{fb.textContent='Comprueba las tres dimensiones: largo, ancho y alto se duplican; 2 × 2 × 2 = 8.';fb.classList.add('revisar')}
});
$('arista').addEventListener('input',e=>{const a=Number(e.target.value);$('valor-arista').textContent=`${a} cm`;$('area-cara').textContent=`${a*a} cm²`;$('area-total').textContent=`${superficie(a)} cm²`;$('volumen').textContent=`${volumen(a)} cm³`});
sync();
