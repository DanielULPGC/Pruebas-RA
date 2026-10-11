import * as THREE from 'three';
import {mountCover} from '../../portada-escena.mjs';
const root=document.querySelector('[data-cover-scene]');
if(root)mountCover(root,THREE);
