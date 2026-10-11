# Portada candidata Three.js

Alcance autorizado: únicamente la portada. Continúa desde Historia V2 (00ed3c6); index.html, taller, pirámides y sus datos permanecen idénticos a esa base. La portada alternativa se mantiene en portada-candidata.html.

La nueva escena es propia: cubo, esfera y pirámide con iluminación, sombras y plataforma circular. Las proporciones son compositivas, sin escala métrica ni histórica. Se inspira en el tratamiento tridimensional de la referencia aportada, sin trasladar su escena vegetal, código, fotografías ni efectos de revelado.

## Revisar

Abrir PREVIEW/portada-threejs.html tras descomprimir el ZIP, con un navegador que ejecute JavaScript y WebGL2. Three.js y el controlador están integrados en ese HTML; la escena no necesita CDN, texturas ni módulos remotos. Los enlaces de las actividades llevan al sitio público. Si no existe WebGL compatible, se conserva el SVG alternativo y se ocultan los controles 3D.

La candidata completa incluye los archivos del laboratorio existentes y debe servirse por HTTP/HTTPS. El visor model-viewer existente continúa usando su proveedor habitual. La nueva escena no modifica dicho visor, sus modelos ni sus escalas.

## Controles y movimiento

Arrastre horizontal; botones de giro a izquierda/derecha; restablecer; giro automático opcional, apagado al iniciar. El arrastre permite el desplazamiento vertical táctil de la página. La preferencia de movimiento reducido desactiva el giro automático. El renderizado continuo solo se solicita durante ese giro, con la escena visible y la pestaña activa; los demás cambios solicitan un fotograma. Se limita la densidad de píxeles a 1,25 en la escena estrecha y a 1,5 en la amplia.

## Construcción

Three.js 0.180.0 y esbuild 0.25.12 fijados. Desde la raíz del proyecto, en un entorno de desarrollo con estas dependencias, ejecutar `node design/portada-threejs/build.cjs`. El resultado portada-threejs.js es un paquete clásico autocontenido; esbuild es una dependencia de desarrollo y no se carga en el sitio. La licencia MIT completa de Three.js se conserva en vendor/three/LICENSE. No se añade un gestor de dependencias a la aplicación publicada.

## Pruebas reproducibles

Con Three.js 0.180.0 y jsdom 30.1.2 disponibles en el entorno de desarrollo: `node design/portada-threejs/test-interaccion.cjs` y `node design/portada-threejs/test-preview.cjs`. jsdom es solo una dependencia de comprobación. No se carga en el sitio. Los informes generados son deterministas para estas versiones.

## Evidencia y límites

La interacción se comprueba con DOM sintético y un renderer simulado; la geometría y la proyección usan Three.js real en CPU. Estas comprobaciones no prueban renderizado WebGL, rendimiento en dispositivos, teclado real, zoom ni convivencia con model-viewer en navegador. No se presenta el SVG alternativo como captura del 3D.

La candidata no está publicada. Se conservan los estados documentales y de RA física pendientes del proyecto. El ZIP es acumulativo desde main 7d0e11e: incluye los cambios de diseño anteriores para no depender de que ya estén incorporados.
