# Animación

[Introducción](#introducción)  
[Fotogramas clave](#fotogramas-clave)  
[Física](#física)  
[Estructuras articuladas](#estructuras-articuladas)  
[Galería](#galería)  
[Tarea](#tarea)  
[Referencias](#referencias)




## Introducción

En prácticas previas se ha producido comportamiento dinámico a través de modificaciones en la posición y orientación de los objetos y la cámara. En relación a la cámara, se han descrito ejemplos utilizando [*OrbitControls*](https://threejs.org/docs/#examples/en/controls/OrbitControls), [*FlyControls*](https://threejs.org/docs/?q=flycontrols#examples/en/controls/FlyControls) o [*TrackballControls*](https://threejs.org/docs/?q=trackballcontrols#examples/en/controls/TrackballControls). Sugerir a las personas interesadas experimentar con los ejemplos de [*FirstPersonControls*](https://threejs.org/docs/?q=firstperson#examples/en/controls/FirstPersonControls) (alternativa a *FlyControls*), y la posibilidad de modificar parámetros de la cámara ilustrada en el ejemplo [*Cinematic camera*](https://threejs.org/examples/#webgl_camera_cinematic).

De cara a disponer de elementos adicionales para integrar movimiento, en estas sesiones se abordan en primer término posibilidades de definición de fotogramas clave, posteriormente se introduce una biblioteca de física disponible para three.js, y se finaliza con ejemplos básicos de estructuras articuladas.

## Fotogramas clave

Si bien existen alternativas como [Theather.js](https://www.theatrejs.com/docs/0.5/getting-started/with-three-js), en los ejemplos acontinuación, se adopta la biblioteca [Tween.js](https://github.com/tweenjs/tween.js), que aún siendo sencilla, permite realizar animaciones de cuerpos rígidos basadas en interpolación de propiedades de HTML5 y JavaScript. Sugerir visitar y ejecutar la galería de ejemplos del repositorio
para animaciones variadas de HTML5. En los ejemplos a continuación, únicamente se afecta a propiedades de los objetos three.js.

Para la utilización de tween.js en el código, observarás la presencia de un nuevo *import* en las primeras líneas de los ejemplos:

```
import TWEEN from 'https://cdn.jsdelivr.net/npm/@tweenjs/tween.js@18.5.0/dist/tween.esm.js'
```

La biblioteca permite calcular valores intermedios tras definir propiedades de comienzo y final, pudiendo disponer de dichos valores interpolados para actualizar los objetos de la escena. La interpolación de valores en animación se conoce como *tweening*. Un primer ejemplo es [*script_41_tween.js*](https://github.com/otsedom/otsedom.github.io/blob/main/IG/S10/code/script_41_tween.js) que tras crear un cubo en una determinada posición, lo traslada hacia la derecha en un lapsus de dos segundos. Es un ejemplo mínimo. 

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

Además de ser neceria la definición del *tween*, no hay que olvidar que en el bucle de animación se lanza la actualización de *TWEEN*.

```
function animationLoop() {
  requestAnimationFrame(animationLoop);

  TWEEN.update();

  renderer.render(scene, camera);
}
```

Los valores de partida o inicio del *tween* se definen en el primer bloque entre llaves. Los valores objetivo del *tween* están descritos en el bloque *.to* de nuevo entre llaves, definiendo a continuación el tiempo en milisegundos de duración del *tween*. Las acciones a realizar en cada fotograma, se especifican en *.onUpdate*. Existen otro manejadores, destacando:
- *.delay*: Especifica la pausa tras finalizar
- *.repeat*: Si aparece, indica el número de repeticiones activada o *infinity* para repetir la animación de forma eterna
- *.easing* para definir la forma de lo rápido o lento que la interpolación a la salida y entrada (o ambas).
Los tipos existentes son: *Linear*, *Quadratic*, *Cubic*, *Quartic*, *Quintic*, *Sinusoidal*, *Exponential*, *Circular*, *Elastic*, *Back* y *Bounce*, pudiendo aplicarse a: *In*, *Out* e *InOut*. Por defecto la interpolación entre los valores es lineal, sugerir una visita al [listado ilustrado](https://kodi.wiki/view/Tweeners) para conocer y previsualizar los distintos modos de *easing*.

Tener en cuenta que el último manejador añade al final un *;* para cerrar la descripción del *tween*.

De cara a añadir movimiento en la componente *y*, nuevamente es necesario definir los valores de inicio y fin. Por ejemplo la de inicio:

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
En el ejemplo [*script_42_tween_cubos.js*](https://github.com/otsedom/otsedom.github.io/blob/main/IG/S10/code/script_42_tween_cubos.js) se crean varios cubos que realizan el mismo comportamiento.

```
//Objetos
let px = -5;
let ite;
Cubo(px, 0, 0, 0.9, 0.9, 0.9, 0x00ff00);
Cubo(px + 1, 0, 0, 0.9, 0.9, 0.9, 0x00ff00);
Cubo(px + 2, 0, 0, 0.9, 0.9, 0.9, 0x00ff00);
Cubo(px + 3, 0, 0, 0.9, 0.9, 0.9, 0x00ff00);


// Encadena tweens
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

También aparecen las funciones *.onRepeat* para realizar acciones tras cada repetición, así como *.onStart* que permite realizar acciones al inicio. No se ha hecho uso de otras como *.onEveryStart*, se ejecuta antes de cada repetición, u *.onComplete* tras finalizar. Tampoco se ha aprovechado la posibilidad de especificar valores relativos, o un vector de valores. 


El último ejemplo de esta serie, [*script_43_tween_play_record.js*](https://github.com/otsedom/otsedom.github.io/blob/main/IG/S10/code/script_43_tween_play_record.js), además de realizar una nueva coreografía con varios cubos, salva a disco la salida de pantalla marcando con la tecla *r* el inicio y final del corte deseado. Para ello hace uso de *MediaRecorder*.

Como cierre, recomendar ver la [documentación de *tween.js*](https://github.com/tweenjs/tween.js/blob/main/docs/user_guide.md), señalar que hay posibilidades de añadir *tweens* a la lista activa, detener, agrupar, etc.

<!-- ejemplo con animation track https://threejs.org/examples/misc_animation_keys -->

<!--Un par de ejemplos_
https://threejs.org/examples/css3d_periodictable CSS
https://threejs.org/examples/?q=tween#webgl_animation_keyframes No Tween-->

<!--
Vídeo Suboptimal https://github.com/SuboptimalEng/three-js-tutorials/blob/main/14-tween-js/src/App.jsx
https://www.youtube.com/watch?v=zXqCj8jeAi0 -->

<!-- tween a objetivo en monivmiento Ver https://tweenjs.github.io/tween.js/examples/07_dynamic_to.html -->

## Física

Si bien existen distintas bibliotecas, tanto para 3D como para 2D, adoptamos [ammo.js](https://github.com/kripken/ammo.js/) dado que cuenta con bastantes ejemplos incluidos entre la galería oficial de three.js.
El nombre *Ammo* tiene su origen de *Avoided Making My Own js physics engine by compiling bullet from C++*, estando basada en la biblioteca C++ [*Bullet Collision Detection & Physics Library*](https://pybullet.org/Bullet/BulletFull/classbtTransform.html). Permite gravedad, empujar, colisiones, fricciones, restricciones de movimiento, etc.
Para su uso debemos descargar del [repositorio](https://github.com/kripken/ammo.js/), y añadir en nuestro *index_S10.html* una entrada adaptada a nuestra estructura de directorios. En el ejemplo Glitch, el archivo se encuentra al mismo nivel con lo que se ha incluido la línea:

```
<script src="./ammo.js"></script>
```

Como ejemplo ilustrativo, se han combinado elementos presentes en la galería de [ejemplos disponibles en la web de threejs tras buscar ammo](https://threejs.org/examples/?q=ammo) en el ejemplo  [*script_45_ammo.js*](https://github.com/otsedom/otsedom.github.io/blob/main/IG/S10/code/script_45_ammo.js). No dejes de visitar otros ejemplos disponibles, ya que incluyen otros aspectos, como por ejemplo los elementos deformables.


El código de [*script_45_ammo.js*](https://github.com/otsedom/otsedom.github.io/blob/main/IG/S10/code/script_45_ammo.js), crea una escena con luz direccional, activando sombras, y ambiente, definiendo una estructura de suelo, para la que hace uso de una textura muy sencilla que repite. Sobre ella compone un *muro* compuesto de bloques de color aleatorio. Haciendo clic con el ratón, se aplica un *rayCaster* que habilita el lanzamiento de *proyectiles* que si impactan con el muro lo rompen. La gran diferencia con ejemplos previos es que además de la escena o universo gráfico, es necesario crear un universo físico, en el que los objetos que deseamos que tengan comportamiento físico se configuran. La biblioteca *Ammo*, proporciona el marco para configurar dicho universo en el que se crean entidades con comportamiento dinámico dirigido por las fuerzas definidas. De forma solidaria y coherente con el universo gráfico, el universo físico requiere su actualización desde el bucle de visualización, la función *updatePhysics*, afectando a la transformación de los objetos en dicho universo, dado que se han asociado objetos del mundo gráfico y físico. Los cuales se verán afectados por fuerzas, tienen masa, velocidad, y pueden colisionar. Cada iteración de la dinámica del mundo físico, puede modificar su matriz de transformación. Todos los objetos no reaccionan igual, en el código ejemplo tendremos objetos físicos con forma de paralelepípedo y esferas
*btBoxShape* y *btSphereShape*, que se asociarán a objetos del mundo gráfico. Este ejemplo se limita al uso de cuerpos rígidos (para cuerpos deformables, recordar nuevamente los ejemplos de la galería [cloth](https://threejs.org/examples/?q=ammo#physics_ammo_cloth) y [volume](https://threejs.org/examples/?q=ammo#physics_ammo_volume)).

<!--

Y comentar con este blog
[Using Physics in Three.js with Ammo.js – Introduction](https://en.threejs-university.com/2021/08/24/using-physics-in-three-js-with-ammo-js-introduction/)
[Understanding and Utilizing Physics in Three.JS with Ammo.js : The Basics](https://en.threejs-university.com/2021/08/27/three-js-physics-ammo-js/)
[Using Physics in Three.JS with Ammo.js : Demolishing a Wall](https://en.threejs-university.com/2021/08/27/using-physics-in-three-js-with-ammo-js-demolishing-a-wall/)

Tutorial
[Intro to JavaScript 3D Physics using Ammo.js and Three.js](https://medium.com/@bluemagnificent/intro-to-javascript-3d-physics-using-ammo-js-and-three-js-dd48df81f591) -->

<!--
He visto también cosas como:
Lo más actualizado parece enable3d Physics Plugin for three.js https://www.npmjs.com/package/@enable3d/ammo-physics el código es máscompacto que el ejemplo usado
https://enable3d.io/examples.html-->

<!--
Physics World: There has to be a world that obeys the laws of physics except you are in a parallel Universe that has its own set of Physical Laws. In ammo.js this world is called a Collision World and has among its derivatives the Dynamic World. The physics world has options to set gravity and exposes functions and objects for the following to be possible.
Rigid Body Dynamics: The force, mass, inertia, velocity and constraints of the World. In a snooker game you take a shot, the cue ball rolls and knocks against ball which gradually rolls before coming to a stop. Or you shot a hanging sign post and it swings around.
Collision Filtering and Detection: Collision Filtering sets which objects should collide and which should not. Like a 1Up appearing and the enemies can pass through without absorbing it, but your character passes and picks it up. On the other hand Collision Detection is about detecting when two objects collide, for example, so that you can deduct the health of a monster when your sword slashes through it.
Constraints: Say Joints


Tres tipos de objetos:

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

Si no se plantea la deformación de la geometría, un ejemplo como el mostrado en [*script_46_articulada.js*](https://github.com/otsedom/otsedom.github.io/blob/main/IG/S10/code/script_46_articulada.js) crea *a pelo* distintas mallas de froma jerárquica, haciendo uso de pivotes para facilitar rotaciones. En este caso, además se combina con *tween.js* para componer una pequeña coreografía.

Como es de esperar, *three.js* dispone de utilidades para la descripción de estructuras articuladas ([*Skeleton*](https://threejs.org/docs/#api/en/objects/Skeleton)) compuestas de huesos ([*Bone*](https://threejs.org/docs/#api/en/objects/Bone)) a los que asociar mallas permitiendo de esta forma que la animación de uno o varios huesos afecte a la geometría, resultando en una animación. Para ello se utiliza un tipo de malla ([*SkinnedMesh*](https://threejs.org/docs/#api/en/objects/SkinnedMesh)). La documentación de *SkinnedMesh* incluye un [ejemplo de estructura articulada](https://threejs.org/docs/index.html?q=skeleton#api/en/objects/SkinnedMesh), con la interfaz para modificar los parámetros de los elementos que la componen.
Combinando el mencionado ejemplo de [SkinnedMesh de three.js](https://threejs.org/docs/index.html?q=skeleton#api/en/objects/SkinnedMesh) y la propuesta de [gusano](https://boytchev.github.io/etudes/threejs/psychedelic-tapeworm.html) realizada por [Pavel Boytchev](https://github.com/boytchev), el código [*script_47_bones.js*](https://github.com/otsedom/otsedom.github.io/blob/main/IG/S10/code/script_47_bones.js) que hace uso del tiempo para modificar los huesos asociados a una geometría cilíndrica, provocando un efecto de defomación sobre la *SkinnedMesh* asociada.



Sin embargo, threejs no es un marco pensado para facilitar la creación de los clips de animación de estructuras articuladas, es más frecuente para tal fin utilizar herramientas como Blender y exportar a glTF. Posteriormente, desde *three.js* realziar la carga y animar el clip con [AnimationMixer](https://threejs.org/docs/#api/en/animation/AnimationMixer), como por ejemplo en [webgl_animation_multiple](https://threejs.org/examples/webgl_animation_multiple.html).

En la galería de ejemplos buscando el término *skinning*, accedes a una descriptiva colección incluyendo ejemplos con [cinemática inversa](https://threejs.org/examples/?q=skinning#webgl_animation_skinning_ik). Threejs cuenta con [CCDIKSolver](https://threejs.org/docs/#examples/en/animations/CCDIKSolver) para resolver la cinemática inversa de una estructura articulada. Acepta objetos *SkinnedMesh*, así como obtenidos con [GLTFLoader](https://threejs.org/docs/#examples/en/loaders/GLTFLoader), como el ejemplo anterior, o [MMDLoader](https://threejs.org/docs/#examples/en/loaders/MMDLoader), echa un vistazo a este [ejemplo MMD](https://github.com/mrdoob/three.js/blob/master/examples/webgl_loader_mmd.html).


## Galería

De cursos previos:

- [Sara G.](https://animacion-sarag-2324.glitch.me) y [con shader](https://tween-rubik-2324.glitch.me)
- [Alberto González](https://animacion-albertoglez-2324.glitch.me)
- [Micael Guerra](https://animacion-micael-2324.glitch.me)
- [Simone La Milia](https://simone-2324.glitch.me)
- [Jonay Moreno](https://ig2324-opcional-jonaym.glitch.me)
- [Luis Sánchez](https://animacion-luis-2324.glitch.me)
- [Agustín Vizcaíno](https://animacion-agustinviz-2324.glitch.me)
<!--- [Alejandro?](Campo de tiro)-->





<!-- GALERÍA https://boytchev.github.io/etudes/ -->
<!-- Ejemplo con keyframetrack https://discourse.threejs.org/t/create-skeletal-animation-using-bones/13789/6

script_59_bones.js en glitch testing-->


<!--
Scenegraph y animaciones
https://r105.threejsfundamentals.org/threejs/lessons/threejs-scenegraph.html-->

<!--Animation system https://threejs.org/docs/index.html#manual/en/introduction/Animation-system-->

<!-- CCDIKSolver  https://threejs.org/docs/#examples/en/animations/CCDIKSolver -->



## Tarea

La tarea consiste en proponer un prototipo three.js de temática libre que integre la biblioteca *tween.js* y/o el motor de física *ammo.js*. La entrega se llevará a cabo a través del campus virtual, debiendo incluir enlaces tanto al prototipo como a un vídeo de no más de un minuto de duración con un extracto seleccionado de la animación desarrollada.



## Referencias

Referencias que han servido para la confección de los diversos ejemplos:

- [Documentación](https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene)  
- [Three.js Fundamentals](Three.js Fundamentals)
- [Discover three.js](https://discoverthreejs.com)
- [Learning Three.js](https://github.com/josdirksen/learning-threejs) por [Jos Dirksen](https://github.com/josdirksen)
- [Three.js Cookbook](https://github.com/josdirksen/threejs-cookbook) por [Jos Dirksen](https://github.com/josdirksen) de 2015
- [Three.js University](https://en.threejs-university.com)


***
Bajo licencia de Creative Commons Reconocimiento - No Comercial 4.0 Internacional
