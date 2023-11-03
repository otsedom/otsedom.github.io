# Materiales y más

[Materiales](#materiales)  
[Puerto de vista](#puerto-de-vista)  
[Control de cámara](#control-de-cámara)  
[Tarea](#tarea)  
[Referencias](#referencias)



## Materiales

En ejemplos previos se han mostrado posibilidades de definición de luces, pero no se han descrito las propiedades del material para responder a ellas.
En primer término abordo ejemplos básicos de mapeo de texturas, para posteriormente describir brevemente propiedades del material relacionadas con la iluminación.

### Texturas básicas

Como ejemplo básico de mapeo de texturas, presento el ejemplo *script_21_texturabasica.js* en cuyo código se añade una propiedad al material de la malla de la esfera y del cubo, justamente la textura que se previamente a través de llamadas a *TextureLoader*, que se asocia a la propiedad *texture* del material en caso de estar definida como parámetro de entrada. Las funciones de creación de esferas y cubos:


```
const tx1 = new THREE.TextureLoader().load("https://cdn.glitch.global/a3697e1c-92d9-4fc0-985c-d4f5c7dcae9e/earthmap1k.jpg?v=1667386902662");

  ...


function Esfera(px, py, pz, radio, nx, ny, col, texture = undefined) {
  let geometry = new THREE.SphereBufferGeometry(radio, nx, ny);
  //Material básico
  let material = new THREE.MeshBasicMaterial({
    color: col
  });

  //Textura
  if (texture != undefined){
    material.map = texture;
  }

  let mesh = new THREE.Mesh(geometry, material);
   mesh.position.set(px, py, pz);
  scene.add(mesh);
  objetos.push(mesh);
}

function Cubo(px, py, pz, sx, sy, sz, col, texture) {
  //Objeto cubo
  let geometry = new THREE.BoxGeometry(sx, sy, sz);
  let material = new THREE.MeshBasicMaterial({
    color: col
  });

  //Textura
  if (texture != undefined){
    material.map = texture;
  }
  let mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(px, py, pz);
  //Objeto añadido a la escena
  scene.add(mesh);
  objetos.push(mesh);
}
```

En ambos casos se utiliza el material básico, recordar que si requiere usar la iluminación, se hará uso un material de Phong o similar, debiendo definirse las luces. Puedes observar que el color del objeto afecta al color visto de la textura.

Es importante señalar que con anterioridad deben subirse las imágenes de los mapas de texturas al
 proyecto Glitch a través de la carpeta de *Assets*. Accediendo a dicha carpeta y abriendo una imagen en particular, se obtiene el *url* que proporcionar a la función de carga  *THREE.TextureLoader().load*

Si se tiene interés en tener transparencias, será necesario definir un mapa de transparencias con valores a para los píxeles transparentes. Además de definir el mapa a través de la propiedad *alphaMap*,en el ejemplo de creación de cubos con textura con transparencias, también se establece la propiedad *transparent* a verdadero, además de la propiedad *side* a *DoubleSide*. Además se puede jugar con la opacidad con la propiedad *opacity*.

```
function CuboAlpha(px, py, pz, sx, sy, sz, col, texture, alpha) {
  //Objeto cubo
  let geometry = new THREE.BoxGeometry(sx, sy, sz);
  let material = new THREE.MeshBasicMaterial({
    color: col
  });

  //Textura
  if (texture != undefined){
    material.map = texture;
    //material.alphaMap  = alpha;
  }
  if (alpha != undefined){
    material.alphaMap  = alpha;
    material.transparent = true;
    material.side = THREE.DoubleSide;
    //material.opacity = 1.0;
  }
  let mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(px, py, pz);
  //Objeto añadido a la escena
  scene.add(mesh);
  objetos.push(mesh);
}
```

Para el caso concreto del cubo, es posible definir texturas para cada cara. La siguiente
función acepta dos mapas de texturas como entrada, y los asocia cada uno a tres caras del cubo.

```
function CuboMultiTex(px, py, pz, sx, sy, sz, col, texture1 = undefined, texture2 = undefined) {
  let geometry = new THREE.BoxBufferGeometry(sx, sy, sz);

  let material1 = new THREE.MeshBasicMaterial({
    color: col
  });

  //Textura
  if (texture1 != undefined){
    material1.map = texture1;
  }

  let material2 = new THREE.MeshBasicMaterial({
    color: col
  });

  //Textura
  if (texture2 != undefined){
    material2.map = texture2;
  }

  let materials = [material1, material2, material1, material2, material1, material2]

  let mesh = new THREE.Mesh(geometry, materials);
   mesh.position.set(px, py, pz);
  scene.add(mesh);
  objetos.push(mesh);
}

```

Añadir un par de ejemplos para hacer uso de una textura de vídeo, tomada desde la [cámara web](https://threejs.org/examples/?q=webcam#webgl_materials_video_webcam), o el uso de [un lienzo para tener una textura dinámica](https://threejs.org/examples/?q=canvas#webgl_materials_texture_canvas).




### Un modelo de planeta tierra

Recuperamos un ejemplo clásico de reproducción del [planeta Tierra](https://geethujp.github.io/earthModel/index.html), que muestro paso a paso. En mi caso las imágenes han sido tomadas del ejemplo de Processing [BlueMarble](https://github.com/codeanticode/pshader-experiments/tree/master/BlueMarble) en el que se consigue similar efecto haciendo uso de *shaders*. Probablemente las texturas utilizadas son las gratuitas disponibles en el repositorio de [texturas de planetas](http://planetpixelemporium.com/planets.html) (algunas de mayor calidad son de pago).

Para ilustrar el modelado del planeta, haré uso del código *script_22_texplaneta*, en el que modifico la función *Esfera* del ejemplo previo con un material que calcule la iluminación además de admitir como parámetros de entrada varios mapas de texturas, cada uno con un fin determinado. La definición de la escena incluye luz ambiente y direccional.

```
function Esfera(padre, px, py, pz, radio, nx, ny, col, texture = undefined, texbump = undefined, texspec = undefined, texalpha = undefined, sombra = false) {
  let geometry = new THREE.SphereBufferGeometry(radio, nx, ny);
  //Material Phong definiendo color
  let material = new THREE.MeshPhongMaterial({
    color: col
  });

  //Textura
  if (texture != undefined){
    material.map = texture;
  }
  //Rugosidad
  if (texbump != undefined){
    material.bumpMap = texbump;
    material.bumpScale = 0.5;
  }

  //Especular
  if (texspec != undefined){
    material.specularMap = texspec;
    material.specular = new THREE.Color('grey');
  }

  //Transparencia
  if (texalpha != undefined){
    //Con mapa de transparencia
    material.alphaMap = texalpha;
    material.transparent = true;
    material.side = THREE.DoubleSide;
    material.opacity = 1.0;

    //Sin mapa de transparencia
    /*material.transparent = true;
    material.side = THREE.DoubleSide;
    material.opacity = 0.8;
    material.transparent = true;
    material.depthWrite = false;*/
  }

  let mesh = new THREE.Mesh(geometry, material);
  if (sombra) mesh.castShadow = true;
  mesh.position.set(px, py, pz);
  padre.add(mesh);
  objetos.push(mesh);
}
```

Puedes observar que la definición de parámetros incluye hasta cinco mapas de texturas, su presencia o no, forzará que se modifiquen propiedades del material. En este sentido, si no se pasan parámetros de textura, tendremos una esfera iluminada.

Tener presente que los mapas de texturas se deben cargar previamente, en el código ejemplo las cinco texturas se cargan en las líneas:

```
//De la superficie
const tx1 = new THREE.TextureLoader().load("https://cdn.glitch.global/8b114fdc-500a-4e05-b3c5-a4afa5246b07/earthmap1k.jpg?v=1666848392635");
const txb1 = new THREE.TextureLoader().load("https://cdn.glitch.global/8b114fdc-500a-4e05-b3c5-a4afa5246b07/earthbump1k.jpg?v=1666848392361");
const txspec1 = new THREE.TextureLoader().load("https://cdn.glitch.global/8b114fdc-500a-4e05-b3c5-a4afa5246b07/earthspec1k.jpg?v=1666848392829");
//Capa de nubes
const tx2 = new THREE.TextureLoader().load("https://cdn.glitch.global/8b114fdc-500a-4e05-b3c5-a4afa5246b07/earthcloudmap.jpg?v=1666848392487");
const txalpha2 = new THREE.TextureLoader().load("https://cdn.glitch.global/8b114fdc-500a-4e05-b3c5-a4afa5246b07/earthcloudmaptrans_invert.jpg?v=1666950065520");
```

Recordar que con anterioridad deben subirse las imágenes de los mapas de texturas al
 proyecto Glitch a través de la carpeta de *Assets*.

El primer paso es adoptar una textura difusa, que se asigna a la propiedad *.map* cuando el parámetro esté presente.


```
Esfera(scene,-6.0, 3.0, 0, 2, 40, 40, 0xffffff, texture = tx1);

...

function Esfera(px, py, pz, radio, nx, ny, col, texture, sombra = false) {
  ...

  //Textura
  if (texture != undefined){
    material.map = texture;
  }

  ...
}
```

El material puede definir un mapa de rugosidad que se especifica a través de la propiedad *.bumpMap*, que puede pesarse con la propiedad *.bumpScale*. Tener en cuenta que no modifica la geometría, solo la iluminación, que en el ejemplo viene producida por una luz direccional que evidencia la influencia del efecto. Sin esta luz, no habrá efecto de rugosidad.


```
Esfera(scene,0.0, 3.0, 0, 2, 40, 40, 0xffffff, texture = tx1, texbump = txb1);
...

function Esfera(px, py, pz, radio, nx, ny, col, texture, sombra = false) {
  ...

  //Rugosidad
  if (texbump != undefined){
    material.bumpMap = texbump;
    material.bumpScale = 0.5;
  }

  ...
}
```

El material también dispone de la propiedad *.specularMap* que permite definir la contribución del brillo de reflexión especular, en este ejemplo se potencia en la zona de los océanos.



```
Esfera(scene,6.0, 3.0, 0, 2, 40, 40, 0xffffff, texture = tx1, texbump = txb1, texspec = txspec1);
...

function Esfera(px, py, pz, radio, nx, ny, col, texture, sombra = false) {
  ...

  //Especular
  if (texspec != undefined){
    material.specularMap = texspec;
    material.specular = new THREE.Color('grey');
  }

  ...
}
```

Para simular la capa de nubes, se crea una segunda esfera con un radio ligeramente superior, a la que se le asigna una textura.

```
//Capa de nubes
//Capa de nubes
//Planeta y capa de nubes sin transparencia
Esfera(scene,-6.0, -3.0, 0, 2, 40, 40, 0xffffff, texture = tx1, texbump = txb1, texspec = txspec1);
//Ancestro el planeta apenas creado, movimiento solidario
Esfera(objetos[3],0.0, 0.0, 0, 2.1, 40, 40, 0xffffff, texture = tx2);
```

El resultado es que ahora no se ve el planeta, dado que la textura de las nubes no se ha definido como transparente y lo oculta al ser opaca. En three.js puede definirse la opacidad del material de forma constante para todo el material, o por medio de un mapa de textura quepermite variar dicha opacidad.
Al contrario que en el ejemplo de Processing en el mapa de transparencias, el blanco se asume como opaco.
En la función *Esfera* ilustro el código con y sin mapa de transparencias:


```
//Planeta y capa de nubes con transparencia
Esfera(scene,6.0, -3.0, 0, 2, 40, 40, 0xffffff, texture = tx1, texbump = txb1, texspec = txspec1);
//Ancestro el planeta apenas creado, movimiento solidario
Esfera(objetos[5],0.0, 0.0, 0, 2.1, 40, 40, 0xffffff, texture = tx2, undefined, undefined, texalpha = txalpha2);


function Esfera(px, py, pz, radio, nx, ny, col, texture, sombra = false) {
  ...

  //Transparencia
  if (texalpha != undefined){
    //Con mapa de transparencia
    material.alphaMap = texalpha;
    material.transparent = true;
    material.side = THREE.DoubleSide;
    material.opacity = 1.0;

    //Sin mapa de transparencia
    /*material.transparent = true;
    material.side = THREE.DoubleSide;
    material.opacity = 0.8;
    material.transparent = true;
    material.depthWrite = false;*/
  }
  ...
}
```

La ejecución con todos los elementos, muestra el planeta en sus diferentes etapas.

Como curiosidades, mencionar los ejemplos de [*PointMaterial*](https://threejs.org/docs/#api/en/materials/PointsMaterial), y  un ejemplo de [destello de lente](https://threejs.org/docs/#examples/en/objects/Lensflare) basado en textura.


<!-- Hay parámetros de textura sobre si repite, etc.


    this.scene = new THREE.Scene()

    const texture = new THREE.TextureLoader().load('images/'+this.image);
    texture.wrapS = THREE.RepeatWrapping;
		texture.repeat.x = -1;


En el ejemplo  que les proporciono utilicé *MeshBasicMaterial*, pero si queremos efectos de iluminación usaremos el correspondiente *MeshPhongMaterial* en su caso

EEJEMPLO CON VARIAS ESFERAS Y MODOS DE WRAPPING

Rycast texture
https://threejs.org/examples/#webgl_raycaster_texture -->


### Iluminación

 En los ejemplos de iluminación se ha hecho uso de objetos creados con [*MeshPhongMaterial*](https://threejs.org/docs/#api/en/materials/MeshPhongMaterial). Hay cuatro propiedades del material que intervienen en el cálculo del color en combinación con las luces definidas


- *.ambient*: Color del material que se combina (producto) con la fuente de luz ambiente. Por defecto es blanco

- *.emissive*:  Color del objeto, no es una fuente de luz. No se ve afectado por la iluminación, por defecto es negro.
- *.specular*:  Define el color del destello, reflejo especular. Si se define con el color del objeto se obtiene un efecto más metálico, si se define gris, más plástico.
- *.shininess*:  Propiedad que define la concentración del reflejo especular, por defecto es 30.


Les proporciono el enlace a un [ejemplo de planeta tierra](https://sbcode.net/threejs/specularmap/) con la interfaz para modificar esas y otras propiedades.
Para ejemplos más avanzados, sugerir visitar los ejemplos proporcionados para el [*MeshPhysicalMaterial*](https://threejs.org/docs/#api/en/materials/MeshPhysicalMaterial).
<!--Modelos de iluminación en threejs
https://cs.wellesley.edu/~cs307/readings/09-lighting-->

<!--
https://threejs.org/examples/#webgl_materials_physical_clearcoat
https://redstapler.co/three-js-realistic-material-reflection-tutorial/



Realistic? light¡Learning
https://www.youtube.com/watch?v=7GGNzryHfTw
Habla de ToneMapping
https://threejs.org/examples/webgl_tonemapping.html

https://medium.com/geekculture/understanding-the-three-js-transmission-example-13e952a8ab55 -->





## Puerto de vista

Por defecto el puerto de vista del reproductor ocupa toda la ventana de visualización. Para mostrar múltiples vistas de una escena,  pudiendo corresponder cada una a una cámara, es posible en la llamada a *renderer*, haber definido previamente con *setViewport* la zona a ocupar

```
let x,y,w,h;

//Efecto similar al de defecto, ocupa toda la ventana
x = Math.floor( window.innerWidth * 0.0 );
y = Math.floor( window.innerHeight * 0.0 );
w = Math.floor( window.innerWidth * 1.0 );
h = Math.floor( window.innerHeight * 1.0 );

renderer.setViewport( x,y,w,h );

renderer.render( scene, cameraxy );
```

Con *x* e *y* se fijan las coordenadas de la esquina superior izquierda, siendo *w* y *h* las que especifican el ancho y alto del puerto de vista. Si interesa que ocupe media ventana a lo ancho:

```
let x,y,w,h;

x = Math.floor( window.innerWidth * 0.0 );
y = Math.floor( window.innerHeight * 0.0 );
w = Math.floor( window.innerWidth * 0.5 );
h = Math.floor( window.innerHeight * 1.0 );

renderer.setViewport( x,y,w,h );

renderer.render( scene, cameraxy );
```

Observarás que se pierde la relación de aspecto, y que la zona de dibujo sigue aparentemente extendiéndose a la derecha. Para lo primero, la relación de aspecto,
se modifica la propiedad *aspect* de la cámara. Para lo segundo se hace uso del método *setScissor* del *renderer*, que implica que la reproducción afecta sólo a la zona especificada.


```
let x,y,w,h;

x = Math.floor( window.innerWidth * 0.0 );
y = Math.floor( window.innerHeight * 0.0 );
w = Math.floor( window.innerWidth * 0.5 );
h = Math.floor( window.innerHeight * 1.0 );

//Establece viewport
renderer.setViewport( x,y,w,h );

//No extiende el color de fondo fuera del viewport
renderer.setScissor( x,y,w,h );
renderer.setScissorTest( true );

//restablece relación de aspecto
cameraxy.aspect = w/h;
cameraxy.updateProjectionMatrix();

renderer.render( scene, cameraxy );
```

¿Te atreves a montar un ejemplo con las tres vistas (*xy*, *yz* y *xz*)?
<!--Un ejemplo con tres vistas (xy, yz y xz) disponible en el ejemplo *P3_01_mmulticam*-->


<!--
## Text Geometry y Etiquetas

```
var options = {
size: 90,
height: 90,
weight: 'normal',
font: 'helvetiker',
style: 'normal',
bevelThickness: 2,
bevelSize: 4,
bevelSegments: 3,
bevelEnabled: true,
curveSegments: 12,
steps: 1
};
text1 = createMesh(new THREE.TextGeometry("Learning", options));
text1.position.z = -100;
text1.position.y = 100;
scene.add(text1);
```



##

NEtiqueta del ejemplo del sistema solar
```
var canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    var ctx = canvas.getContext("2d");
    ctx.font = "44pt Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(name, 128, 44);
    //console.log(ctx);
    var tex = new THREE.Texture(canvas);
    tex.needsUpdate = true;
    var spriteMat = new THREE.SpriteMaterial({
      map: tex
    });
    var sprite = new THREE.Sprite(spriteMat);

    planet.add(sprite);
```

-->



## Control de cámara

En ejemplo previos se ha introducido *OrbitControl*, dedico unas líneas en este apartado a [*FlyControls*](https://threejs.org/docs/#examples/en/controls/FlyControls) que permite modificar la posición y orientación dela cámara. Como punto de partida, usar por ejemplo *script_25_esferasimple*.

<!--En mi máquina he tenido que incluir en *index.html* lo siguiente:

```
<script src="https://threejs.org/examples/js/controls/FlyControls.js"></script>
```
-->

Ya en el código JavaScript, he definido la variable e inicializado  el control en *init* definiendo la cámara que afectará y las propiedades de cambio del control, además de un tiempo inicial, *t0*:

```
flyControls = new THREE.FlyControls(camera, renderer.domElement);
flyControls.dragToLook = true;
flyControls.movementSpeed = .01;
flyControls.rollSpeed = .001;

t0 = new Date();
```

En el bucle de visualización se realiza la actualización en función del tiempo transcurrido:

```
t1 = new Date();
let secs = (t1 - t0) / 1000;
flyControls.update(1 * secs);
```


<!--
FlyControls
https://threejs.org/examples/#misc_controls_fly

https://dustinpfister.github.io/2021/05/05/threejs-fly-controls/


OrbitControl tiene sus propiedades para controlar el movimiento de lacámara

Controlar si hay pan, etc.

controls.rotateSpeed = .07;
controls.enableDamping = true;
controls.dampingFactor = .05;


CameraControls

camera = new THREE.PerspectiveCamera (45, width/height, 1, 10000);
camera.position.y = 160;
camera.position.z = 400;
camera.lookAt (new THREE.Vector3(0,0,0));




TransformControls

var axes = new THREE.AxisHelper( 20 );
scene.add(axes);
-->



## Tarea

Para esta segunda semana, la tarea requiere integrar en el sistema planetario el uso de texturas, poder alternar ( o mostrar de forma simultánea) entre al menos dos cámaras, tener control de cámara (no necesariamente por medio de *FlyControls*) simulando que nos movemos por medio del sistema planetario en una *nave*.




## Referencias

Referencias que han servido para la confección de los diversos ejemplos:

- [Documentación](https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene)  
- [Discover three.js](https://discoverthreejs.com)
- [Three.js Textures](https://r105.threejsfundamentals.org/threejs/lessons/threejs-textures.html)
- [Learning Three.js](https://github.com/josdirksen/learning-threejs) por [Jos Dirksen](https://github.com/josdirksen)
- [Three.js Cookbook](https://github.com/josdirksen/threejs-cookbook) por [Jos Dirksen](https://github.com/josdirksen) de 2015


***
Bajo licencia de Creative Commons Reconocimiento - No Comercial 4.0 Internacional
