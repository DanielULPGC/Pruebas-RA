/* Motor puro de geometría euclídea: seis cuadrados congruentes y cinco bisagras.
 * Unidades geométricas abstractas. Ninguna llamada de red, DOM ni RA. */
export const CARAS = Object.freeze([
  {id:'A',nombre:'Centro · base', cx:0,cy:0,color:'#B9DFEA'},
  {id:'B',nombre:'Izquierda',cx:-1,cy:0,color:'#F7CB99'},
  {id:'C',nombre:'Derecha',cx:1,cy:0,color:'#CECAEF'},
  {id:'D',nombre:'Superior del desarrollo',cx:0,cy:1,color:'#B9DFCA'},
  {id:'E',nombre:'Inferior del desarrollo',cx:0,cy:-1,color:'#F0BFC8'},
  {id:'F',nombre:'Tapa exterior',cx:0,cy:2,color:'#F4E19F'}
]);
const angulo=(fraccion)=>Math.max(0,Math.min(1,fraccion))*Math.PI/2;
export function giroX(p,py,ang){const y=p[1]-py;return [p[0],py+y*Math.cos(ang)-p[2]*Math.sin(ang),y*Math.sin(ang)+p[2]*Math.cos(ang)];}
export function giroY(p,px,ang){const x=p[0]-px;return [px+x*Math.cos(ang)+p[2]*Math.sin(ang),p[1],-x*Math.sin(ang)+p[2]*Math.cos(ang)];}
export function plegarPunto(id,p,fraccion){
 const a=angulo(fraccion);
 switch(id){
   case 'A':return [...p];
   case 'B':return giroY(p,-.5,a);
   case 'C':return giroY(p,.5,-a);
   case 'D':return giroX(p,.5,a);
   case 'E':return giroX(p,-.5,-a);
   case 'F':return giroX(giroX(p,1.5,a),.5,a);
   default:throw new Error('Cara desconocida');
 }
}
export function verticesPlanos(c){const x=c.cx,y=c.cy;return [[x-.5,y-.5,0],[x+.5,y-.5,0],[x+.5,y+.5,0],[x-.5,y+.5,0]];}
export function carasEn(fraccion){return CARAS.map(c=>({...c,vertices:verticesPlanos(c).map(p=>plegarPunto(c.id,p,fraccion))}));}
export function distancia(a,b){return Math.hypot(...a.map((v,i)=>v-b[i]));}
const puntoClave=(p)=>p.map(v=>(Math.round(v*2)/2).toFixed(1)).join(':');
const parClave=(a,b)=>[a,b].sort().join('|');
export function topologia(){
 const vertices=new Map(), aristas=new Map(),carPorId=new Map();
 for(const cara of carasEn(1)){
  const keys=cara.vertices.map(p=>puntoClave(p));
  carPorId.set(cara.id,new Set(keys));
  keys.forEach((k,i)=>{if(!vertices.has(k))vertices.set(k,{clave:k,panel:cara.id,indice:i,caras:[]});vertices.get(k).caras.push(cara.id)});
  keys.forEach((k,i)=>{
   const k2=keys[(i+1)%4],pair=parClave(k,k2);
   if(!aristas.has(pair))aristas.set(pair,{clave:pair,panel:cara.id,desde:i,hasta:(i+1)%4,caras:[]});
   aristas.get(pair).caras.push(cara.id);
  });
 }
 const vs=Array.from(vertices.values()).sort((a,b)=>a.clave.localeCompare(b.clave,'es'));
 const es=Array.from(aristas.values()).sort((a,b)=>a.clave.localeCompare(b.clave,'es'));
 return {vertices:vs.map((v,i)=>({...v,numero:i+1})),aristas:es.map((e,i)=>({...e,numero:i+1})),caras:carPorId};
}
export const TOPOLOGIA=topologia();
export function normal(cara){const [a,b,,d]=cara.vertices;const u=b.map((v,i)=>v-a[i]),v=d.map((v,i)=>v-a[i]);const n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];const len=Math.hypot(...n);return n.map(v=>v/len);}
export function carasOpuestas(){
 const fold=carasEn(1),result={};
 for(const a of fold){const n=normal(a);const b=fold.find(c=>c.id!==a.id&&normal(c).reduce((s,x,i)=>s+x*n[i],0)<-.999999);result[a.id]=b?.id||null;}
 return result;
}
export function proyeccion(pt,vista='planta'){
 const az=(vista==='planta'?0:32)*Math.PI/180, elev=(vista==='planta'?90:42)*Math.PI/180;
 const x=pt[0]*Math.cos(az)-pt[1]*Math.sin(az);
 const y=pt[0]*Math.sin(az)+pt[1]*Math.cos(az);
 return [320+x*98,272-y*Math.sin(elev)*98-pt[2]*Math.cos(elev)*98];
}
export function profundidad(pt,vista='planta'){
 const az=(vista==='planta'?0:32)*Math.PI/180,el=(vista==='planta'?90:42)*Math.PI/180;
 return -(pt[0]*Math.sin(az)+pt[1]*Math.cos(az))*Math.cos(el)+pt[2]*Math.sin(el);
}
export function superficie(a){return 6*a*a;}
export function volumen(a){return a*a*a;}
