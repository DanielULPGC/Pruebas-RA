/** Portada Three.js: escena compositiva actual, sin medidas ni escala histórica. */
export function createCoverScene(T) {
  const scene=new T.Scene();
  const camera=new T.PerspectiveCamera(42,620/540,.1,40);
  camera.position.set(4.1,3.1,7.4);camera.lookAt(0,.1,0);
  const group=new T.Group();group.name='escena-portada';scene.add(group);
  const soft=new T.HemisphereLight(0xdff9ef,0x163346,2.4);scene.add(soft);
  const key=new T.DirectionalLight(0xffefd0,3.1);key.position.set(-3,6,5);key.castShadow=true;
  key.shadow.mapSize.set(512,512);Object.assign(key.shadow.camera,{left:-4,right:4,top:4,bottom:-4,near:.1,far:20});key.shadow.normalBias=.04;scene.add(key);
  const rim=new T.DirectionalLight(0x88d8da,1.8);rim.position.set(4,2,-3);scene.add(rim);
  function mesh(name,geometry,color,x,y,z,edges=false){
    const material=new T.MeshStandardMaterial({color,roughness:.36,metalness:.12});
    const m=new T.Mesh(geometry,material);m.name=name;m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;group.add(m);
    if(edges){const e=new T.LineSegments(new T.EdgesGeometry(geometry),new T.LineBasicMaterial({color:0xe0f3e5,transparent:true,opacity:.75}));m.add(e);}
    return m;
  }
  const platform=mesh('plataforma',new T.CylinderGeometry(3.05,3.12,.22,64),0x9abdbb,0,-1,0);platform.material.roughness=.65;
  const rimBase=mesh('base-plataforma',new T.CylinderGeometry(3.12,3.05,.13,64),0x3c6675,0,-1.17,0);rimBase.castShadow=false;
  const ring=new T.Mesh(new T.RingGeometry(2.61,2.625,96),new T.MeshBasicMaterial({color:0x63888f,transparent:true,opacity:.4,side:T.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=-.883;group.add(ring);
  const cube=mesh('cubo',new T.BoxGeometry(1.65,1.65,1.65),0x60b4b3,0,-.065,-.35,true);cube.rotation.y=-.2;
  const sphere=mesh('esfera',new T.SphereGeometry(.61,32,24),0xefc181,1.87,-.28,.7);
  const lineMat=new T.LineBasicMaterial({color:0x936337,transparent:true,opacity:.45});
  for(const axis of ['x','y','z']){
    const points=[];for(let i=0;i<=96;i++){const a=i/96*Math.PI*2,p=new T.Vector3(Math.cos(a)*.613,Math.sin(a)*.613,0);if(axis==='x')p.set(0,p.x,p.y);if(axis==='y')p.set(p.x,0,p.y);points.push(p);}
    sphere.add(new T.Line(new T.BufferGeometry().setFromPoints(points),lineMat));
  }
  const pyramid=mesh('piramide',new T.ConeGeometry(.93,1.65,4),0xe8ba79,-1.7,-.065,.66,true);pyramid.rotation.y=Math.PI/4;
  const shadow=new T.Mesh(new T.CircleGeometry(3.18,64),new T.MeshBasicMaterial({color:0x061f2b,transparent:true,opacity:.24,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-1.245;group.add(shadow);
  return {scene,camera,group,objects:{cube,sphere,pyramid,platform}};
}

/** env/renderFactory support deterministic DOM tests; production uses the actual WebGL renderer. */
export function mountCover(root,T,options={}) {
  if(!root)return null;
  const env=options.env||window,doc=root.ownerDocument;
  const frame=root.querySelector('[data-scene-frame]'),canvas=root.querySelector('canvas'),fallback=root.querySelector('[data-scene-fallback]');
  const controls=root.querySelector('[data-scene-controls]'),caption=root.querySelector('[data-scene-caption]'),status=root.querySelector('[data-scene-status]');
  const buttons=Object.fromEntries([...root.querySelectorAll('[data-scene-action]')].map(b=>[b.dataset.sceneAction,b]));
  const reduced=env.matchMedia('(prefers-reduced-motion: reduce)');
  let renderer=null,model=null,raf=0,last=0,visible=true,automatic=false,drag=null,disposed=false,failed=false;
  const listeners=[];function on(el,type,fn,opt){el.addEventListener(type,fn,opt);listeners.push(()=>el.removeEventListener(type,fn,opt));}
  const canAnimate=()=>automatic&&!reduced.matches&&visible&&!doc.hidden&&!disposed;
  function sync(){buttons.auto.setAttribute('aria-pressed',String(automatic));buttons.auto.textContent=automatic?'Pausar giro':'Giro automático';buttons.auto.disabled=reduced.matches;}
  function schedule(){if(!renderer||disposed||!visible||doc.hidden||raf)return;raf=env.requestAnimationFrame(draw);}
  function draw(time){raf=0;if(!renderer||disposed||!visible||doc.hidden){last=0;return;}
    if(canAnimate()){const dt=last?Math.min((time-last)/1000,.06):0;model.group.rotation.y+=dt*.22;last=time;}else last=0;
    try{renderer.render(model.scene,model.camera);}catch(_){fail();return;}
    if(canAnimate())schedule();
  }
  function pause(){automatic=false;last=0;if(raf){env.cancelAnimationFrame(raf);raf=0;}sync();}
  function fail(){failed=true;pause();controls.hidden=true;canvas.hidden=true;root.classList.remove('escena-lista');fallback.removeAttribute('aria-hidden');
    caption.textContent='ILUSTRACIÓN GEOMÉTRICA · SIN ESCALA';status.textContent='Se muestra la ilustración estática. Puedes continuar hacia las actividades.';
    if(renderer){try{renderer.dispose();}catch(_){}renderer=null;}
  }
  function resize(){if(!renderer)return;const rect=frame.getBoundingClientRect();const width=Math.max(1,Math.round(rect.width)),height=Math.max(1,Math.round(rect.height));
    renderer.setPixelRatio(Math.min(env.devicePixelRatio||1,width<500?1.25:1.5));renderer.setSize(width,height,false);
    model.camera.aspect=width/height;model.camera.updateProjectionMatrix();schedule();
  }
  function start(){if(renderer||failed||disposed)return;
    try{model=createCoverScene(T);renderer=options.rendererFactory?options.rendererFactory(canvas):new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
      renderer.setClearColor(0x000000,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
      renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
      resize();renderer.render(model.scene,model.camera);
      canvas.hidden=false;controls.hidden=false;fallback.setAttribute('aria-hidden','true');root.classList.add('escena-lista');
      caption.textContent='ESCENA 3D INTERACTIVA · SIN ESCALA';status.textContent=reduced.matches?'Puedes girar la escena con los botones.':'Arrastra horizontalmente para girar la escena o utiliza los botones.';sync();
    }catch(_){fail();}
  }
  on(buttons.left,'click',()=>{if(!model||!renderer)return;pause();model.group.rotation.y-=Math.PI/8;schedule();});
  on(buttons.right,'click',()=>{if(!model||!renderer)return;pause();model.group.rotation.y+=Math.PI/8;schedule();});
  on(buttons.reset,'click',()=>{if(!model||!renderer)return;pause();model.group.rotation.set(0,0,0);schedule();});
  on(buttons.auto,'click',()=>{if(!renderer||reduced.matches)return;automatic=!automatic;last=0;sync();schedule();});
  on(canvas,'pointerdown',e=>{if(!renderer||e.isPrimary===false||e.button!==0)return;pause();drag={id:e.pointerId,x:e.clientX};canvas.setPointerCapture?.(e.pointerId);canvas.classList.add('arrastrando');});
  on(canvas,'pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;model.group.rotation.y+=(e.clientX-drag.x)*.008;drag.x=e.clientX;schedule();});
  function release(e){if(drag&&drag.id===e.pointerId){drag=null;canvas.classList.remove('arrastrando');}}
  for(const event of ['pointerup','pointercancel','lostpointercapture'])on(canvas,event,release);
  on(canvas,'webglcontextlost',e=>{e.preventDefault();fail();});
  on(doc,'visibilitychange',()=>{last=0;if(doc.hidden&&raf){env.cancelAnimationFrame(raf);raf=0;}else schedule();});
  on(reduced,'change',()=>{if(reduced.matches)pause();sync();if(renderer)status.textContent=reduced.matches?'Puedes girar la escena con los botones.':'Arrastra horizontalmente para girar la escena o utiliza los botones.';schedule();});
  let observer=null,resizeObserver=null;
  if(env.IntersectionObserver){observer=new env.IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);last=0;if(visible){start();schedule();}else if(raf){env.cancelAnimationFrame(raf);raf=0;}},{rootMargin:'80px'});observer.observe(root);}else start();
  if(env.ResizeObserver){resizeObserver=new env.ResizeObserver(resize);resizeObserver.observe(frame);}else on(env,'resize',resize);
  function dispose(){disposed=true;if(raf)env.cancelAnimationFrame(raf);listeners.forEach(off=>off());observer?.disconnect();resizeObserver?.disconnect();
    if(model){const geometries=new Set(),materials=new Set();model.scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:o.material?[o.material]:[])materials.add(m);});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}
    renderer?.dispose();renderer=null;
  }
  on(env,'pagehide',e=>{if(!e.persisted)dispose();});
  sync();return {dispose,getState:()=>({ready:!!renderer,failed,automatic,visible,reduced:reduced.matches,rotation:model?.group.rotation.y||0})};
}
