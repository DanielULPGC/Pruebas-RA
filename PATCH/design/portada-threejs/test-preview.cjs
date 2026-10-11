const fs=require('fs'),assert=require('node:assert/strict');const {JSDOM,VirtualConsole}=require('jsdom');
const root=require('node:path').resolve(__dirname,'../..');const errors=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(fs.readFileSync(root+'/design/portada-threejs/vista-previa.html','utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://example.invalid/preview.html',virtualConsole:vc,beforeParse(w){const media=new w.EventTarget();media.matches=false;w.matchMedia=()=>media;w.HTMLCanvasElement.prototype.getContext=()=>null;}});
const rootEl=dom.window.document.querySelector('[data-cover-scene]');
assert.equal(rootEl.classList.contains('escena-lista'),false);assert.equal(rootEl.querySelector('[data-scene-controls]').hidden,true);assert.ok(rootEl.querySelector('[data-scene-status]').textContent.includes('estática'));assert.deepEqual(errors,[]);dom.window.close();
const result={resultado:'PASS',tipo:'Bundle entregable ejecutado en DOM sintético con contexto gráfico nulo. No renderizado WebGL.',controles:['Bundle y controlador integrados ejecutan sin excepciones no manejadas','Alternativa SVG visible sin WebGL','Controles 3D ocultos sin WebGL'],errores:errors};
fs.writeFileSync(root+'/design/portada-threejs/verificacion-preview.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
