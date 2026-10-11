const fs=require('fs'),assert=require('node:assert/strict');const {JSDOM}=require('jsdom');
const root=require('node:path').resolve(__dirname,'../..');
(async()=>{
const T=require('three');
const {createCoverScene,mountCover}=await import(root+'/portada-escena.mjs');let checks=0;
const model=createCoverScene(T);model.scene.updateMatrixWorld(true);model.camera.updateMatrixWorld(true);
assert.equal(model.objects.cube.geometry.type,'BoxGeometry');assert.equal(model.objects.sphere.geometry.type,'SphereGeometry');assert.equal(model.objects.pyramid.geometry.parameters.radialSegments,4);checks+=3;
const projected=[];for(const obj of Object.values(model.objects)){const a=obj.geometry.attributes.position;for(let i=0;i<a.count;i++){const p=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(obj.matrixWorld).project(model.camera);projected.push(p);}}
const bounds={maxX:Math.max(...projected.map(p=>Math.abs(p.x))),maxY:Math.max(...projected.map(p=>Math.abs(p.y))),minZ:Math.min(...projected.map(p=>p.z)),maxZ:Math.max(...projected.map(p=>p.z))};
assert.ok(bounds.maxX<.97&&bounds.maxY<.97&&bounds.minZ>-1&&bounds.maxZ<1,JSON.stringify(bounds));checks++;
const allBounds={maxX:0,maxY:0,minZ:1,maxZ:-1};
for(let k=0;k<24;k++){model.group.rotation.y=k*Math.PI/12;model.scene.updateMatrixWorld(true);model.scene.traverse(o=>{const a=o.geometry?.attributes.position;if(!a)return;for(let i=0;i<a.count;i++){const p=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(o.matrixWorld).project(model.camera);allBounds.maxX=Math.max(allBounds.maxX,Math.abs(p.x));allBounds.maxY=Math.max(allBounds.maxY,Math.abs(p.y));allBounds.minZ=Math.min(allBounds.minZ,p.z);allBounds.maxZ=Math.max(allBounds.maxZ,p.z);}});}
assert.ok(allBounds.maxX<.97&&allBounds.maxY<.97&&allBounds.minZ>-1&&allBounds.maxZ<1,JSON.stringify(allBounds));checks++;model.group.rotation.y=0;

for(const obj of Object.values(model.objects)){const a=obj.geometry.attributes.position;assert.ok([...a.array].every(Number.isFinite));checks++;}
function setup(fail=false,reduced=false){
const dom=new JSDOM(fs.readFileSync(root+'/portada-candidata.html','utf8'),{pretendToBeVisual:true,url:'https://example.invalid/portada-candidata.html'}),w=dom.window,d=w.document;let q=new Map(),rid=0,io,hidden=false;const media=new w.EventTarget();media.matches=reduced;w.matchMedia=()=>media;
w.requestAnimationFrame=f=>{q.set(++rid,f);return rid};w.cancelAnimationFrame=id=>q.delete(id);Object.defineProperty(d,'hidden',{get:()=>hidden,configurable:true});
w.IntersectionObserver=class{constructor(fn){io=fn}observe(){}disconnect(){}};w.ResizeObserver=class{constructor(fn){this.fn=fn}observe(){}disconnect(){}};
const rootEl=d.querySelector('[data-cover-scene]'),frame=rootEl.querySelector('[data-scene-frame]');frame.getBoundingClientRect=()=>({width:620,height:540});
const calls={render:0,dispose:0,size:[],pixel:[]};const renderer={shadowMap:{},setClearColor(){},setPixelRatio(x){calls.pixel.push(x)},setSize(w,h){calls.size.push([w,h])},render(){calls.render++},dispose(){calls.dispose++}};
const app=mountCover(rootEl,T,{env:w,rendererFactory(){if(fail)throw Error('GPU no disponible, prueba');return renderer}});
return {w,d,app,calls,media,root:rootEl,q,flush(t){const jobs=[...q.values()];q.clear();jobs.forEach(fn=>fn(t))},visible(v){io([{isIntersecting:v}])},hidden(v){hidden=v;d.dispatchEvent(new w.Event('visibilitychange'))},button(id){return rootEl.querySelector('[data-scene-action="'+id+'"]')},end(){app.dispose();dom.window.close()}};
}
let x=setup();assert.equal(x.calls.render,0);checks++;x.visible(true);assert.equal(x.app.getState().ready,true);assert.equal(x.root.querySelector('[data-scene-controls]').hidden,false);checks+=2;x.flush(100);assert.equal(x.q.size,0);checks++;
x.button('right').click();assert.ok(x.app.getState().rotation>0);x.button('left').click();assert.ok(Math.abs(x.app.getState().rotation)<1e-8);checks+=2;
x.button('auto').click();assert.equal(x.button('auto').getAttribute('aria-pressed'),'true');x.flush(200);x.flush(300);assert.ok(x.app.getState().rotation>0);assert.equal(x.q.size,1);checks+=3;
x.hidden(true);assert.equal(x.q.size,0);x.hidden(false);assert.equal(x.q.size,1);checks+=2;x.visible(false);assert.equal(x.q.size,0);x.visible(true);assert.equal(x.q.size,1);checks+=2;
x.media.matches=true;x.media.dispatchEvent(new x.w.Event('change'));assert.equal(x.app.getState().automatic,false);assert.equal(x.button('auto').disabled,true);x.flush(400);assert.equal(x.q.size,0);checks+=3;
x.button('right').click();assert.ok(x.app.getState().rotation>0);x.button('reset').click();assert.equal(x.app.getState().rotation,0);checks+=2;
const canvas=x.root.querySelector('canvas');const down=new x.w.Event('pointerdown');Object.assign(down,{button:0,isPrimary:true,pointerId:1,clientX:100});canvas.dispatchEvent(down);const move=new x.w.Event('pointermove');Object.assign(move,{pointerId:1,clientX:150});canvas.dispatchEvent(move);assert.ok(x.app.getState().rotation>.39);checks++;
canvas.dispatchEvent(new x.w.Event('webglcontextlost',{cancelable:true}));assert.equal(x.app.getState().ready,false);assert.equal(x.root.querySelector('[data-scene-controls]').hidden,true);assert.equal(x.root.querySelector('[data-scene-fallback]').hasAttribute('aria-hidden'),false);assert.equal(canvas.hidden,true);checks+=4;x.end();
x=setup(true);x.visible(true);assert.equal(x.app.getState().failed,true);assert.ok(x.root.querySelector('[data-scene-status]').textContent.includes('estática'));assert.equal(x.q.size,0);checks+=3;x.end();
x=setup(false,true);x.visible(true);assert.equal(x.button('auto').disabled,true);assert.equal(x.app.getState().automatic,false);checks+=2;x.end();
const result={resultado:'PASS',tipo:'Geometría y proyección con Three.js real en CPU; interacción con DOM sintético y renderer simulado. No prueba GPU ni navegador.',three:T.REVISION,comprobaciones:checks,encuadre_inicial:bounds,encuadre_giro_24_angulos:allBounds,controles:['giro por botones y arrastre','restablecer','giro automático optativo','reducir movimiento','parada fuera de pantalla y pestaña oculta','sin WebGL y pérdida de contexto'],pendientes:['Renderizado WebGL real','aspecto en móvil, teclado real y zoom','convivencia con model-viewer en navegador']};
fs.writeFileSync(root+'/design/portada-threejs/verificacion-interaccion.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
})().catch(e=>{console.error(e);process.exitCode=1});
