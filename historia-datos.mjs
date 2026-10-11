/** P4.4-H1. Casos didácticos extraídos de Kelly (2026); valores modernos, no transcripción. */
export const CASOS = Object.freeze({
  p2: Object.freeze({
    titulo: 'Problema 2 · Un volumen discutible', figura:'A.1',
    diagrama:'fuentes/kelly_2026_A1_problema_2.png',
    alt:'Edición de Kelly de tres diagramas asociados al problema 2, con signos numéricos griegos y pérdida parcial del extremo derecho.',
    modelo:'modelos_glb/historico_ortoedro_relativo.glb',
    descripcion:'El texto principal menciona un cubo de arista 10 pies. Los diagramas asociados ensayan otros valores para aplicar nuevamente el procedimiento. Analizamos solo el diagrama de la izquierda.',
    magnitudes:[8,5,20], unidad:'pies', resultadoAnotado:80, resultadoCalculado:800,
    pregunta:'En el diagrama izquierdo se leen tres longitudes que Kelly interpreta como 8, 5 y 20 pies. ¿Qué volumen resulta de multiplicarlas?',
    opciones:[{id:'80',texto:'80 pies cúbicos'},{id:'800',texto:'800 pies cúbicos'},{id:'1000',texto:'1000 pies cúbicos'}],
    correcta:'800',
    explicacion:'8 × 5 × 20 = 800 pies cúbicos. Kelly señala 80 en el diagrama y plantea la posibilidad de un error de cálculo. No podemos saber con certeza cómo se originó.',
    limite:'El 800 es el resultado aritmético moderno a partir de las dimensiones interpretadas por Kelly; el 80 pertenece al diagrama editado. No debe atribuirse automáticamente al escriba una causa concreta del desajuste.'
  }),
  p8: Object.freeze({
    titulo:'Problema 8 · Un cubo de seis pies', figura:'A.2',
    diagrama:'fuentes/kelly_2026_A2_problema_8.png',
    alt:'Figura A.2 de Kelly con versiones editadas de dos cubos incompletos y representaciones gráficas normalizadas debajo.',
    modelo:'modelos_glb/cubo.glb',
    descripcion:'Kelly identifica dos diagramas de cubos. En el de la izquierda se indica una arista de 6 pies. La relación exacta del diagrama derecho con el segundo cubo es incierta.',
    magnitudes:[6,6,6], unidad:'pies', resultadoAnotado:null, resultadoCalculado:216,
    pregunta:'Si tomamos un cubo de 6 pies de arista, ¿cuál es su volumen matemático?',
    opciones:[{id:'36',texto:'36 pies cúbicos'},{id:'216',texto:'216 pies cúbicos'},{id:'not',texto:'No puede calcularse con ese dato'}],
    correcta:'216',
    explicacion:'En un cubo todas las aristas tienen la misma longitud. 6 × 6 × 6 = 216 pies cúbicos. Es una comprobación matemática actual, no una transcripción del resultado original del papiro.',
    limite:'La figura original está dañada, los dibujos no están a escala y Kelly considera incierta la interpretación de algunas marcas del cubo derecho.'
  })
});
export function calcularVolumen(medidas){ if(!Array.isArray(medidas)||medidas.length!==3||medidas.some(n=>typeof n!=="number"||!Number.isFinite(n)||n<=0))throw Error('Medidas inválidas'); return medidas.reduce((a,b)=>a*b,1); }
export function evaluar(caso,opcion){if(!(caso in CASOS)) throw Error('Caso no definido');return {acierto:opcion===CASOS[caso].correcta,explicacion:CASOS[caso].explicacion};}
