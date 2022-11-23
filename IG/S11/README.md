# Animación

[Introducción](#introducción)  
[Fotogramas clave](#fotogramas-clave)  
[Física](#física)  
[Tareas](#tarea)  
[Referencias](#referencias)



## Introducción

Realmente en prácticas previas has producido comportamiento dinámico a través de modificaciones en la posición y orientación de los objetos y la cámara. En relación a la cámara, se han mostrado ejemplos utilizando [OrbitControls](https://threejs.org/docs/#examples/en/controls/OrbitControls), [FlyControls](https://threejs.org/docs/?q=flycontrols#examples/en/controls/FlyControls) o [TrackballControls](https://threejs.org/docs/?q=trackballcontrols#examples/en/controls/TrackballControls). Sugerir a las personas interesadas visitar los ejemplos de [FirstPersonControls](https://threejs.org/docs/?q=firstperson#examples/en/controls/FirstPersonControls) (alternativa a FlyControls), y la posibilidad de modificar parámetros de la cámara ilustrada en el ejemplo [*Cinematic camera*](https://threejs.org/examples/#webgl_camera_cinematic).

De cara a disponer de elementos adicionales para integrar movimiento, en estas sesiones se abordan en primer término posibilidades de definición de fotogramas clave, para posteriormente introducir una biblioteca de física.

## Fotogramas clave

Si bien existen alternativas como [Theather.js](https://www.theatrejs.com/docs/0.5/getting-started/with-three-js), en los ejemplos adopto la biblioteca [Tween.js](https://github.com/tweenjs/tween.js), que aún siendo sencilla, permite realizar animaciones de cuerpos rígidos basadas en interpolación de propiedades
de HTML5 y JavaScript. Sugerir visitar y ejecutar la galería de ejemplos del repositorio
para animaciones variadas de HTML5. En los ejemplos a continuación, sólo afecto a propiedades de los objetos three.js.

Para su utilización en el código, tras descargar desde la página del proyecto, mencionada más arriba, he movido a la carpeta que me interese el archivo *tween.umd.js*, y necesitaré hacerle referencia en mi *index.html*. En mi caso, lo he colocado al mismo nivel, por tanto:

```
<script src="./tween.umd.js"></script>
```

La biblioteca permite calcular valores intermedios tras definir propiedades de comienzo y final, pudiendo disponer de dichos valores interpolados para actualizar los objetos de la escena. La interpolación de valores en animación se conoce como *tweening*. Un primer ejemplo es *script_51_tween.js* que tras crear un cubo en una determinada posición, lo traslada hacia la derecha en un lapsus de dos segundos.


```
let scene, renderer;
let camera;
let objetos = [];

init();
animationLoop();

function init() {
  //Defino cámara
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 10);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  //Objetos
  Cubo(-2.0, 0, 0, 3, 3, 3, 0x00ff00);

  let tomove = objetos[0];

  // Define keyframes y propiedades a interpolar
  const tween1 = new TWEEN.Tween({ x: -4.0 })
    .to({ x: 0. }, 2000)
    .onUpdate((coords) => {
      tomove.position.x = coords.x;     
    })
    .easing(TWEEN.Easing.Exponential.InOut)
    .delay(100)
    .repeat(5);

  tween1.start();
}

function Cubo(px, py, pz, sx, sy , sz, col) {
  let geometry = new THREE.BoxBufferGeometry(sx, sy , sz);
  //Material con o sin relleno
  let material = new THREE.MeshNormalMaterial({
    color: col,
    //wireframe: true, //Descomenta para activar modelo de alambres
  });

  let mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(px, py, pz);
  scene.add(mesh);
  objetos.push(mesh);
}

//Bucle de animación
function animationLoop() {
  requestAnimationFrame(animationLoop);

  TWEEN.update();

  renderer.render(scene, camera);
}
```

Es un ejemplo mínimo. Además de la actualización de TWEEN en el bucle, lo
novedoso es la definición de un *tween*:

```
// Define keyframes y propiedades a interpolar
  const tween1 = new TWEEN.Tween({ x: -4.0})
    .to({ x: 0. }, 2000)
    .onUpdate((coords) => {
      tomove.position.x = coords.x;     
    })
    .easing(TWEEN.Easing.Exponential.InOut)
    .delay(100)
    .repeat(5);

  tween1.start();
```

Los valores de partida se definen en el primer bloque entre llaves. Los valores al finalizar están descritos en el bloque *.to*. Las acciones a realizar en cada fotograma, se especifican en *.onUpdate*. Además se presentan varios comandos:
- *.delay*: Especifica la pausa tras finalizar
- *.repeat*: Si aparece, indica el número de repeticiones activada o *infinity* para repetir la animación de forma eterna
- *.easing* para definir la forma de lo rápido o lento que la interpolación a la salida y entrada (o ambas).
Los tipos existentes son: *Linear*, *Quadratic*, *Cubic*, *Quartic*, *Quintic*, *Sinusoidal*, *Exponential*, *Circular*, *Elastic*, *Back* y *Bounce*, pudiendo aplicarse a: *In*, *Out* e *InOut*.
Por defecto es lineal, sugerir una visita al [listado ilustrado](https://kodi.wiki/view/Tweeners) para conocer y previsualizar los distintos modos de *easing*.

Para añadir movimiento en la componente y, es necesario definir posición de inicio y fin. Por ejemplo la de inicio:

```
  const tween1 = new TWEEN.Tween({ x: -4.0, y: 0})
```

Si también quieres rotar, una posibilidad puede ser:
```
  const tween1 = new TWEEN.Tween({ x: -4.0, y: 0, xRotation: 0 })
```

El ejemplo contiene un único *tween*. El siguiente extracto, crea varios y los encadena:

```
// Define keyframes y propiedades a interpolar
 const tween1 = new TWEEN.Tween({ x: -4.0, y: 0, xRotation: 0 })
   .to({ x: 0., y: 2, xRotation: Math.PI / 2 }, 2000)
   .onUpdate((coords) => {
     tomove.position.x = coords.x;
     tomove.position.y = coords.y;
     tomove.rotation.x = coords.xRotation;
   })
   .easing(TWEEN.Easing.Exponential.InOut)
   .delay(100);
 const tween2 = new TWEEN.Tween({x: 0., y: 2, xRotation: Math.PI / 2 })
   .to({ x: 4.0, y: 0, xRotation: 0 }, 2000)
   .onUpdate((coords) => {
     tomove.position.x = coords.x;
     tomove.position.y = coords.y;
     tomove.rotation.x = coords.xRotation;
   })
   .easing(TWEEN.Easing.Linear.None)
   .delay(100);
 const tween3 = new TWEEN.Tween({x: 4., y: 0, xRotation: Math.PI / 2 })
   .to({ x: -4.0, y: 0, xRotation: 0 }, 2000)
   .onUpdate((coords) => {
     tomove.position.x = coords.x;
     tomove.position.y = coords.y;
     tomove.rotation.x = coords.xRotation;
   })
   .easing(TWEEN.Easing.Linear.None)
   .delay(100);
 //Encadena los tweens
 tween1.chain(tween2);
 tween2.chain(tween3);
 tween3.chain(tween1);
 tween1.start();
```

El los ejemplos anteriores, se actualizan parámetros de un único objeto.
En el ejemplo *script_52_tween_cubos* creo varios cubos que realizan el mismo comportamiento.

```
//Objetos
let px = -5;
let ite;
Cubo(px, 0, 0, 0.9, 0.9, 0.9, 0x00ff00);
Cubo(px + 1, 0, 0, 0.9, 0.9, 0.9, 0x00ff00);
Cubo(px + 2, 0, 0, 0.9, 0.9, 0.9, 0x00ff00);
Cubo(px + 3, 0, 0, 0.9, 0.9, 0.9, 0x00ff00);


// Encadena tweens together
const tween1 = new TWEEN.Tween({ x: 0, xRotation: 0, col: 0xffff00 })
.to({ x: 3, xRotation: Math.PI / 2, col: 0xffffff }, 2000)
.onUpdate((coords) => {
  let idx = 0;
  for(let object of objetos) {
    object.position.x = px + idx + coords.x;
    object.rotation.x = coords.xRotation;
    idx += 1;
  }
  })
.onRepeat((info) => {
    px += 3;
    ite += 1;
    })
.onStart(() => {
    ite = 0;
    })
.easing(TWEEN.Easing.Exponential.InOut)
.delay(100)
.repeat(5)				  

tween1.start();
```

También aparecen las funciones *.onRepeat* para realizar acciones tras cada repetición, así coo *.onStart* que permite realizar acciones al inicio. No se ha hecho uso de otras como *.onEveryStart*, se ejecuta antes de cada repetición, u *.onComplete* tras finalizar. Tampoco se ha aprovechado la posibilidad de especificar valores relativos, o un vector de valores. Sugerir ver la [documentación](https://github.com/tweenjs/tween.js/blob/main/docs/user_guide.md), añadir que hay  posibilidades de añadir *tweens* a la lista activa, detener, agrupar, etc.

<!--Un par de ejemplos_

https://threejs.org/examples/css3d_periodictable CSS
https://threejs.org/examples/?q=tween#webgl_animation_keyframes No Tween-->



<!--
Vídeo Suboptimal https://github.com/SuboptimalEng/three-js-tutorials/blob/main/14-tween-js/src/App.jsx
https://www.youtube.com/watch?v=zXqCj8jeAi0 -->


## Tareas

Se definirán completamente la semana que viene, si bien lógicamente una tarea incluirá el uso de *Tween.js*


## Referencias

Referencias que han servido para la confección de los diversos ejemplos:

- [Documentación](https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene)  
- [Three.js Fundamentals](Three.js Fundamentals)
- [Discover three.js](https://discoverthreejs.com)
- [Learning Three.js](https://github.com/josdirksen/learning-threejs) por [Jos Dirksen](https://github.com/josdirksen)
- [Three.js Cookbook](https://github.com/josdirksen/threejs-cookbook) por [Jos Dirksen](https://github.com/josdirksen) de 2015


***
Bajo licencia de Creative Commons Reconocimiento - No Comercial 4.0 Internacional
