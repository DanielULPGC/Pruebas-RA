// Desarrollo únicamente: npm install --no-save three@0.180.0 esbuild@0.25.12
const path=require('node:path');const fs=require('node:fs');const esbuild=require('esbuild');
const root=path.resolve(__dirname,'../..');
const threeRoot=path.resolve(path.dirname(require.resolve('three')),'..');
const threePackage=path.join(threeRoot,'package.json');
if(JSON.parse(fs.readFileSync(threePackage)).version!=='0.180.0')throw Error('Se requiere three 0.180.0');
if(require('esbuild').version!=='0.25.12')throw Error('Se requiere esbuild 0.25.12');
esbuild.build({absWorkingDir:root,entryPoints:[path.join(__dirname,'entrada.mjs')],outfile:path.join(root,'portada-threejs.js'),bundle:true,minify:true,format:'iife',platform:'browser',target:['es2020'],nodePaths:(process.env.NODE_PATH||'').split(path.delimiter).filter(Boolean),legalComments:'inline',banner:{js:'/*! Portada Geometría en tus manos. Incluye Three.js 0.180.0. */\n/*\n'+fs.readFileSync(path.join(threeRoot,'LICENSE'),'utf8')+'\n*/'},metafile:true}).then(result=>{const meta={inputs:{},outputs:{}};for(const [key,value] of Object.entries(result.metafile.inputs)){const name=key.includes('/node_modules/three/')?'three@0.180.0/'+key.split('/node_modules/three/')[1]:path.isAbsolute(key)?path.relative(root,key):key;meta.inputs[name]={bytes:value.bytes};}for(const [key,value] of Object.entries(result.metafile.outputs))meta.outputs[key]={bytes:value.bytes,entryPoint:value.entryPoint};fs.writeFileSync(path.join(__dirname,'bundle-metafile.json'),JSON.stringify(meta,null,2)+'\n');}).catch(e=>{console.error(e);process.exitCode=1;});
