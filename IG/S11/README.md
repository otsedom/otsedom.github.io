# Animación

[Introducción](#introducción)  
[Fotogramas clave](#fotogramas-clave)  
[Física](#física)  
[Estructuras articuladas](#estructuras-articuladas)
[Tareas](#tarea)  
[Referencias](#referencias)

## Introducción

En prácticas previas se ha producido comportamiento dinámico a través de modificaciones en la posición y orientación de los objetos y la cámara. En relación a la cámara, se han descrito ejemplos utilizando [OrbitControls](https://threejs.org/docs/#examples/en/controls/OrbitControls), [FlyControls](https://threejs.org/docs/?q=flycontrols#examples/en/controls/FlyControls) o [TrackballControls](https://threejs.org/docs/?q=trackballcontrols#examples/en/controls/TrackballControls). Sugerir a las personas interesadas visitar los ejemplos de [FirstPersonControls](https://threejs.org/docs/?q=firstperson#examples/en/controls/FirstPersonControls) (alternativa a FlyControls), y la posibilidad de modificar parámetros de la cámara ilustrada en el ejemplo [*Cinematic camera*](https://threejs.org/examples/#webgl_camera_cinematic).

De cara a disponer de elementos adicionales para integrar movimiento, en estas sesiones se abordan en primer término posibilidades de definición de fotogramas clave, para posteriormente introducir una biblioteca de física disponible para threejs.

## Fotogramas clave

Si bien existen alternativas como [Theather.js](https://www.theatrejs.com/docs/0.5/getting-started/with-three-js), en los ejemplos adopto la biblioteca [Tween.js](https://github.com/tweenjs/tween.js), que aún siendo sencilla, permite realizar animaciones de cuerpos rígidos basadas en interpolación de propiedades
de HTML5 y JavaScript. Sugerir visitar y ejecutar la galería de ejemplos del repositorio
para animaciones variadas de HTML5. En los ejemplos a continuación, sólo afecto a propiedades de los objetos three.js.

Para su utilización en el código, tras descargar desde la página del proyecto, mencionada más arriba, he copiado en la carpeta de mis ejemplos Javascript el archivo *tween.umd.js*, y necesitaré hacerle referencia en mi *index.html*, como puedes observar en *index_S11.html*. En mi caso, lo he colocado al mismo nivel, por tanto:

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
novedoso es la definición del *tween*:

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

Para añadir movimiento en la componente *y*, es necesario definir posición de inicio y fin. Por ejemplo la de inicio:

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

En los ejemplos mostrados hasta ahora, se actualizan parámetros de un único objeto.
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

También aparecen las funciones *.onRepeat* para realizar acciones tras cada repetición, así como *.onStart* que permite realizar acciones al inicio. No se ha hecho uso de otras como *.onEveryStart*, se ejecuta antes de cada repetición, u *.onComplete* tras finalizar. Tampoco se ha aprovechado la posibilidad de especificar valores relativos, o un vector de valores. Sugerir ver la [documentación](https://github.com/tweenjs/tween.js/blob/main/docs/user_guide.md), añadir que hay posibilidades de añadir *tweens* a la lista activa, detener, agrupar, etc.


<!-- ejemplo con animation track https://threejs.org/examples/misc_animation_keys -->

<!--Un par de ejemplos_

https://threejs.org/examples/css3d_periodictable CSS
https://threejs.org/examples/?q=tween#webgl_animation_keyframes No Tween-->



<!--
Vídeo Suboptimal https://github.com/SuboptimalEng/three-js-tutorials/blob/main/14-tween-js/src/App.jsx
https://www.youtube.com/watch?v=zXqCj8jeAi0 -->


## Física

Existen distintas bibliotecas, tanto para 3D como para 2D, sin embargo [ammo.js](https://github.com/kripken/ammo.js/) cuenta con bastantes ejemplos incluidos entre la galería oficial de three.js, y por dicha razón la he adoptado para el ejemplo incluido en esta introducción.

Cuentan que Ammo viene de *Avoided Making My Own js physics engine by compiling bullet from C++*, estando basada en la biblioteca C++ [*Bullet Collision Detection & Physics Library*](https://pybullet.org/Bullet/BulletFull/classbtTransform.html). Permite gravedad, empujar, colisiones, fricciones, restricciones de movimiento, etc.

Para su uso debemos descargar del repositorio, y añadir en nuestro *index_S11.html* algo adaptado a nuestra estructura de directorios. En el ejemplo Glitch, he copiado el archivo al mismo nivel con lo que he necesitado:

```
<script src="./ammo.js"></script>
```

Como ejemplo ilustrativo, he combinado elementos presentes en la galería de [ejemplos disponibles en la web de threejs tras buscar ammo](https://threejs.org/examples/?q=ammo). No dejes de visitar los ejemplos disponibles, ya que incluyen elementos deformables.

El código ejemplo está en el archivo *script_55_ammo.js*

```
let camera, controls, scene, renderer;
let textureLoader;
const clock = new THREE.Clock();

const mouseCoords = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const ballMaterial = new THREE.MeshPhongMaterial({ color: 0x202020 });

// Mundo físico con Ammo
let physicsWorld;
const gravityConstant = 7.8;
let collisionConfiguration;
let dispatcher;
let broadphase;
let solver;

const margin = 0.05; //margen colisiones

// Objetos rígidos
const rigidBodies = [];

const pos = new THREE.Vector3();
const quat = new THREE.Quaternion();
//Variebles temporales para actualizar transformación en el bucle
let transformAux1;
let tempBtVec3_1;

//Inicialización
Ammo().then(function (AmmoLib) {
  Ammo = AmmoLib;

  init();
  animationLoop();
});

function init() {
  initGraphics();
  initPhysics();
  createObjects();
  initInput();
}

function initGraphics() {
  //Cámara, escena, renderer y control de cámara
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.2,
    2000
  );
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xbfd1e5);
  camera.position.set(-14, 8, 16);

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 2, 0);
  controls.update();

  textureLoader = new THREE.TextureLoader();

  //Luces
  const ambientLight = new THREE.AmbientLight(0x707070);
  scene.add(ambientLight);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(-10, 18, 5);
  light.castShadow = true;
  const d = 14;
  light.shadow.camera.left = -d;
  light.shadow.camera.right = d;
  light.shadow.camera.top = d;
  light.shadow.camera.bottom = -d;

  light.shadow.camera.near = 2;
  light.shadow.camera.far = 50;

  light.shadow.mapSize.x = 1024;
  light.shadow.mapSize.y = 1024;

  scene.add(light);
  //Redimensión de la ventana
  window.addEventListener("resize", onWindowResize);
}

function initPhysics() {
  // Configuración Ammo
  // Colisiones
  collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
  // Gestor de colisiones convexas y cóncavas
  dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
  // Colisión fase amplia
  broadphase = new Ammo.btDbvtBroadphase();
  // Resuelve resricciones de reglas físicas como fuerzas, gravedad, etc.
  solver = new Ammo.btSequentialImpulseConstraintSolver();
  // Crea en mundo físico
  physicsWorld = new Ammo.btDiscreteDynamicsWorld(
    dispatcher,
    broadphase,
    solver,
    collisionConfiguration
  );
  // Establece gravedad
  physicsWorld.setGravity(new Ammo.btVector3(0, -gravityConstant, 0));

  transformAux1 = new Ammo.btTransform();
  tempBtVec3_1 = new Ammo.btVector3(0, 0, 0);
}

//Objeto con posición y orientación especificada con cuaternión
function createObject(mass, halfExtents, pos, quat, material) {
  const object = new THREE.Mesh(
    new THREE.BoxGeometry(
      halfExtents.x * 2,
      halfExtents.y * 2,
      halfExtents.z * 2
    ),
    material
  );
  object.position.copy(pos);
  object.quaternion.copy(quat);
}

function createObjects() {
  // Suelo
  pos.set(0, -0.5, 0);
  quat.set(0, 0, 0, 1);
  const suelo = createBoxWithPhysics(
    40,
    1,
    40,
    0,
    pos,
    quat,
    new THREE.MeshPhongMaterial({ color: 0xffffff })
  );
  suelo.receiveShadow = true;
  textureLoader.load(
    "https://cdn.glitch.global/8b114fdc-500a-4e05-b3c5-a4afa5246b07/grid.png?v=1669716810074",
    function (texture) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(40, 40);
      suelo.material.map = texture;
      suelo.material.needsUpdate = true;
    }
  );

  // Muro
  createWall();
}

function createWall() {
  const brickMass = 0.5;
  const brickLength = 1.2;
  const brickDepth = 0.6;
  const brickHeight = brickLength * 0.5;
  const numBricksLength = 6;
  const numBricksHeight = 8;
  const z0 = -numBricksLength * brickLength * 0.5;
  pos.set(0, brickHeight * 0.5, z0);
  quat.set(0, 0, 0, 1);
  for (let j = 0; j < numBricksHeight; j++) {
    //Varía disposición entre filas pares e impares
    const oddRow = j % 2 == 1;

    pos.z = z0;
    if (oddRow) {
      pos.z -= 0.25 * brickLength;
    }

    const nRow = oddRow ? numBricksLength + 1 : numBricksLength;
    //Compone fila
    for (let i = 0; i < nRow; i++) {
      let brickLengthCurrent = brickLength;
      let brickMassCurrent = brickMass;

      if (oddRow && (i == 0 || i == nRow - 1)) {
        brickLengthCurrent *= 0.5;
        brickMassCurrent *= 0.5;
      }

      const brick = createBoxWithPhysics(
        brickDepth,
        brickHeight,
        brickLengthCurrent,
        brickMassCurrent,
        pos,
        quat,
        createMaterial()
      );
      brick.castShadow = true;
      brick.receiveShadow = true;

      if (oddRow && (i == 0 || i == nRow - 2)) {
        pos.z += 0.75 * brickLength;
      } else {
        pos.z += brickLength;
      }
    }
    pos.y += brickHeight;
  }
}

function createBoxWithPhysics(sx, sy, sz, mass, pos, quat, material) {
  const object = new THREE.Mesh(
    new THREE.BoxGeometry(sx, sy, sz, 1, 1, 1),
    material
  );
  //Estructura geométrica de colisión
  //Crea caja orientada en el espacio, especificando dimensiones
  const shape = new Ammo.btBoxShape(
    new Ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5)
  );
  //Margen para colisione
  shape.setMargin(margin);

  createRigidBody(object, shape, mass, pos, quat);

  return object;
}

//Creación de cuerpo rígido, con masa, sujeto a fuerzas, colisiones...
function createRigidBody(object, physicsShape, mass, pos, quat, vel, angVel) {
  //Posición
  if (pos) {
    object.position.copy(pos);
  } else {
    pos = object.position;
  }
  //Cuaternión, es decir orientación
  if (quat) {
    object.quaternion.copy(quat);
  } else {
    quat = object.quaternion;
  }
  //Matriz de transformación
  const transform = new Ammo.btTransform();
  transform.setIdentity();
  transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
  transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
  const motionState = new Ammo.btDefaultMotionState(transform);
  //Inercia inicial y parámetros de rozamiento, velocidad
  const localInertia = new Ammo.btVector3(0, 0, 0);
  physicsShape.calculateLocalInertia(mass, localInertia);
  //Crea el cuerpo
  const rbInfo = new Ammo.btRigidBodyConstructionInfo(
    mass,
    motionState,
    physicsShape,
    localInertia
  );
  const body = new Ammo.btRigidBody(rbInfo);

  body.setFriction(0.5);

  if (vel) {
    body.setLinearVelocity(new Ammo.btVector3(vel.x, vel.y, vel.z));
  }

  if (angVel) {
    body.setAngularVelocity(new Ammo.btVector3(angVel.x, angVel.y, angVel.z));
  }

  //Enlaza primitiva gráfica con física
  object.userData.physicsBody = body;
  object.userData.collided = false;

  scene.add(object);
  //Si tiene masa
  if (mass > 0) {
    rigidBodies.push(object);
    // Disable deactivation
    body.setActivationState(4);
  }
  //Añadido al universo físico
  physicsWorld.addRigidBody(body);

  return body;
}

function createRandomColor() {
  return Math.floor(Math.random() * (1 << 24));
}

function createMaterial(color) {
  color = color || createRandomColor();
  return new THREE.MeshPhongMaterial({ color: color });
}

//Evento de ratón
function initInput() {
  window.addEventListener("pointerdown", function (event) {
    //Coordenadas del puntero
    mouseCoords.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );

    raycaster.setFromCamera(mouseCoords, camera);

    // Crea bola como cuerpo rígido y la lanza según coordenadas de ratón
    const ballMass = 35;
    const ballRadius = 0.4;
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(ballRadius, 14, 10),
      ballMaterial
    );
    ball.castShadow = true;
    ball.receiveShadow = true;
    //Ammo
    //Estructura geométrica de colisión esférica
    const ballShape = new Ammo.btSphereShape(ballRadius);
    ballShape.setMargin(margin);
    pos.copy(raycaster.ray.direction);
    pos.add(raycaster.ray.origin);
    quat.set(0, 0, 0, 1);
    const ballBody = createRigidBody(ball, ballShape, ballMass, pos, quat);

    pos.copy(raycaster.ray.direction);
    pos.multiplyScalar(24);
    ballBody.setLinearVelocity(new Ammo.btVector3(pos.x, pos.y, pos.z));
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animationLoop() {
  requestAnimationFrame(animationLoop);

  const deltaTime = clock.getDelta();
  updatePhysics(deltaTime);

  renderer.render(scene, camera);
}

function updatePhysics(deltaTime) {
  // Avanza la simulación en función del tiempo
  physicsWorld.stepSimulation(deltaTime, 10);

  // Actualiza cuerpos rígidos
  for (let i = 0, il = rigidBodies.length; i < il; i++) {
    const objThree = rigidBodies[i];
    const objPhys = objThree.userData.physicsBody;
    //Obtiene posición y rotación
    const ms = objPhys.getMotionState();
    //Actualiza la correspondiente primitiva gráfica asociada
    if (ms) {
      ms.getWorldTransform(transformAux1);
      const p = transformAux1.getOrigin();
      const q = transformAux1.getRotation();
      objThree.position.set(p.x(), p.y(), p.z());
      objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());

      objThree.userData.collided = false;
    }
  }
}

```

El código crea una escena con luz direccional, activando sombras, y ambiente, definiendo una estructura de suelo, para la que hace uso de una textura muy sencilla que repite. Sobre ella compone un *muro* compuesto de bloques de color aleatorio. Haciendo clic con el ratón se lanzan *proyectiles* que si impactan con el muro lo rompen. La gran diferencia con ejemplos previos es que además de la escena o universo gráfico, es necesario crear un universo físico, en el que los objetos que deseamos que tengan comportamiento físico se configuran. La biblioteca Ammo, proporciona el marco para configurar dicho universo en el que se crean entidades con comportamiento dinámico dirigido por las fuerzas definidas. De forma solidaria y coherente con el universo gráfico, el universo físico requiere su actualización desde el bucle de visualización, función *updatePhysics*, afectando a la transformación de los objetos en dicho universo, dado que se han asociado objetos del mundo gráfico y físico.

El ejemplo introducido se limita al uso de cuerpos rígidos (para cuerpos deformables, sugerir los ejemplos de la galería [cloth](https://threejs.org/examples/?q=ammo#physics_ammo_cloth) y [volume](https://threejs.org/examples/?q=ammo#physics_ammo_volume) ), los cuales se verán afectados por fuerzas, tienen masa, velocidad, y pueden colisionar. Cada iteración de la dinámica del mundo físico, puede modificar su matriz de transformación. Todos los objetos no reaccionan igual, en el código ejemplo tendremos objetos físicos con forma de paralelepípedo y esferas
*btBoxShape* y *btSphereShape*, que se asociarán a objetos del mundo gráfico

<!--

Y comentar con este blog
[Using Physics in Three.js with Ammo.js – Introduction](https://en.threejs-university.com/2021/08/24/using-physics-in-three-js-with-ammo-js-introduction/)

[Understanding and Utilizing Physics in Three.JS with Ammo.js : The Basics](https://en.threejs-university.com/2021/08/27/three-js-physics-ammo-js/)

[Using Physics in Three.JS with Ammo.js : Demolishing a Wall](https://en.threejs-university.com/2021/08/27/using-physics-in-three-js-with-ammo-js-demolishing-a-wall/)

Tutorial
[Intro to JavaScript 3D Physics using Ammo.js and Three.js](https://medium.com/@bluemagnificent/intro-to-javascript-3d-physics-using-ammo-js-and-three-js-dd48df81f591) -->

<!--
He visto también cosas como:
Lo más actualizado parece enable3d Physics Plugin for three.js https://www.npmjs.com/package/@enable3d/ammo-physics el código es máscompacto que el ejemplo que tengo

https://enable3d.io/examples.html-->

<!--



Physics World: There has to be a world that obeys the laws of physics except you are in a parallel Universe that has its own set of Physical Laws. In ammo.js this world is called a Collision World and has among its derivatives the Dynamic World. The physics world has options to set gravity and exposes functions and objects for the following to be possible.
Rigid Body Dynamics: The force, mass, inertia, velocity and constraints of the World. In a snooker game you take a shot, the cue ball rolls and knocks against ball which gradually rolls before coming to a stop. Or you shot a hanging sign post and it swings around.
Collision Filtering and Detection: Collision Filtering sets which objects should collide and which should not. Like a 1Up appearing and the enemies can pass through without absorbing it, but your character passes and picks it up. On the other hand Collision Detection is about detecting when two objects collide, for example, so that you can deduct the health of a monster when your sword slashes through it.
Constraints: Say Joints


Tres tiposde objetos:

- Dynamic (moving) rigidbodies: positive mass, every simulation frame the dynamics will update its world transform.
Se mueven con To move a dynamic rigid body you either use applyForce, applyImpulse or setLinearVelocity


- Static rigidbodies: zero mass, cannot move but just collide.

- Kinematic rigidbodies: zero mass, can be animated by the user, but there will be only one way interaction: dynamic objects will be pushed away but there is no influence from dynamic objects.

Suboptimal Usa Cannon como https://github.com/SuboptimalEng/three-js-tutorials


Con quien colisiona

physicsWorld.addRigidBody( body, colGroupRedBall, colGroupPlane | colGroupGreenBall );




Este blog
https://threejs-journey.com/lessons/physics# relaciona varios paquetes

Básico ammo.js
https://www.youtube.com/watch?v=N8n9RChyLXU

http://schteppe.github.io/ammo.js-demos/

Pero hay ejemplos en three (buscar ammo)
https://github.com/mrdoob/three.js/blob/master/examples/physics_ammo_break.html
https://threejs.org/examples/?q=ammo#physics_ammo_instancing



ejemplos
https://github.com/kripken/ammo.js/


Cap. 12 Física -->


## Estructuras articuladas

Threejs cuenta con elementos para la descripción de estructuras articuladas ([*Skeleton*](https://threejs.org/docs/#api/en/objects/Skeleton)) compuestas de huesos ([*Bone*](https://threejs.org/docs/#api/en/objects/Bone)) a los que asociar mallas que permiten la animación de la geometría ([*SkinnedMesh*](https://threejs.org/docs/#api/en/objects/SkinnedMesh)). La documentación de *SkinnedMesh* incluye un ejemplo de estructura articulada, con la interfaz para modificar los parámetros de los elementos que la componen.

Sin embargo, threejs no es un marco pensado para facilitar la creación de los clips de animación de estructuras articuladas, es más frecuente para tal fin utilizar herramientas como Blender exportar a glTF. En la galería de ejemplos buscando el término *skinning*, accedes a una descriptiva colección incluyendo ejemplos con [cinemática inversa](https://threejs.org/examples/?q=skinning#webgl_animation_skinning_ik). Threejs cuenta con [CCDIKSolver](https://threejs.org/docs/#examples/en/animations/CCDIKSolver) para resolver la cinemática inversa de una estructura articulada. Acepta objetos *SkinnedMesh*, así como obtenidos con [GLTFLoader](https://threejs.org/docs/#examples/en/loaders/GLTFLoader), como el ejemplo anterior, o [MMDLoader](https://threejs.org/docs/#examples/en/loaders/MMDLoader), echa un vistazo a este [ejemplo MMD](https://github.com/mrdoob/three.js/blob/master/examples/webgl_loader_mmd.html).


<!-- Ejemplo con keyframetrack https://discourse.threejs.org/t/create-skeletal-animation-using-bones/13789/6

script_59_bones.js en glitch testing-->


<!--
Scenegraph y animaciones
https://r105.threejsfundamentals.org/threejs/lessons/threejs-scenegraph.html-->

<!--Animation system https://threejs.org/docs/index.html#manual/en/introduction/Animation-system-->

<!-- CCDIKSolver  https://threejs.org/docs/#examples/en/animations/CCDIKSolver -->



## Tareas

La tarea consiste en proponer un prototipo three.js de temática libre que integre la biblioteca *tween.js* y/o el motor de física *ammo.js*.


## Referencias

Referencias que han servido para la confección de los diversos ejemplos:

- [Documentación](https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene)  
- [Three.js Fundamentals](Three.js Fundamentals)
- [Discover three.js](https://discoverthreejs.com)
- [Learning Three.js](https://github.com/josdirksen/learning-threejs) por [Jos Dirksen](https://github.com/josdirksen)
- [Three.js Cookbook](https://github.com/josdirksen/threejs-cookbook) por [Jos Dirksen](https://github.com/josdirksen) de 2015

[Three.js University](https://en.threejs-university.com)


***
Bajo licencia de Creative Commons Reconocimiento - No Comercial 4.0 Internacional
