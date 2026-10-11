/* Interfaz sin almacenamiento, analítica ni peticiones adicionales de datos. */
'use strict';
const indice = new Map(CATALOGO.map((f) => [f.id, f]));
const visor = document.querySelector('#visor');
const botonSolucion = document.querySelector('#consultar');
const solucion = document.querySelector('#solucion');
const propiedades = document.querySelector('#tabla-propiedades');
const botonPropiedades = document.querySelector('#desplegar');
const respuesta = document.querySelector('#respuesta');
let seleccionado = 'cubo';
function elegir(id, registrar = true) {
  const f = indice.get(id);
  if (!f) return;
  seleccionado=id;
  document.querySelector('#titulo-figura').textContent=f.nombre;
  document.querySelector('#tipo-figura').textContent=(f.tipo === 'poliedro') ? 'Poliedro' : 'Cuerpo redondo';
  document.querySelector('#reto').textContent=f.reto;
  document.querySelector('#tamano').textContent='Medidas nominales: '+f.dimensiones_cm.join(' × ')+' cm';
  document.querySelector('#prop-tipo').textContent=f.tipo === 'poliedro' ? 'Poliedro' : 'Cuerpo redondo';
  document.querySelector('#prop-caras').textContent=f.caras_planas;
  document.querySelector('#prop-aristas').textContent=f.aristas_rectas;
  document.querySelector('#prop-vertices').textContent=f.vertices;
  visor.setAttribute('src',f.glb);
  visor.setAttribute('alt','Modelo tridimensional interactivo de '+f.nombre.toLowerCase());
  // Quick Look genera USDZ automáticamente al no especificar ios-src (model-viewer 4.3.1).
  document.querySelectorAll('[data-figura]').forEach(b => {
    const activa=b.dataset.figura===id;
    b.classList.toggle('seleccionada',activa);
    if (activa) b.setAttribute('aria-current','true'); else b.removeAttribute('aria-current');
  });
  solucion.hidden=true;solucion.textContent='';
  propiedades.hidden=true;
  botonSolucion.setAttribute('aria-expanded','false');
  botonPropiedades.setAttribute('aria-expanded','false');
  botonSolucion.textContent='Ver solución razonada';
  botonPropiedades.innerHTML='Mostrar propiedades geométricas <span aria-hidden="true">⌄</span>';
  respuesta.value='';
  if(registrar){const u=new URL(location.href);u.searchParams.set('figura',id);history.replaceState(null,'',u);}
}
for (const boton of document.querySelectorAll('[data-figura]')) {
  boton.addEventListener('click',()=>elegir(boton.dataset.figura));
}
botonSolucion.addEventListener('click',()=>{
  const abrir=solucion.hidden;
  solucion.hidden=!abrir;
  if(abrir) solucion.textContent='Solución razonada: '+indice.get(seleccionado).solucion;
  botonSolucion.setAttribute('aria-expanded',String(abrir));
  botonSolucion.textContent=abrir?'Ocultar solución':'Ver solución razonada';
});
botonPropiedades.addEventListener('click',()=>{
  const abrir=propiedades.hidden;
  propiedades.hidden=!abrir;
  botonPropiedades.setAttribute('aria-expanded',String(abrir));
  botonPropiedades.innerHTML=(abrir?'Ocultar':'Mostrar')+' propiedades geométricas <span aria-hidden="true">'+(abrir?'⌃':'⌄')+'</span>';
});
document.querySelector('#limpiar').addEventListener('click',()=>{respuesta.value='';respuesta.focus()});
let inicial = new URL(location.href).searchParams.get('figura');
elegir(indice.has(inicial)?inicial:'cubo',false);
