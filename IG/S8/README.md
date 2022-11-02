# Sombras, materiales y más

[Sombras](#sombras)  
[Materiales](#materiales)  
[Puerto de vista](#puerto-de-vista)  
[Control de cámara](#control-de-cámara)  
[Tarea](#tarea)  
[Referencias](#referencias)

## Sombras

Three.js proporciona soporte para sombras. Al no estar activo por deefcto,  debe indicarse al definir un objeto si proyecta sombras, propiedad *.castShadow*, y si las recibe, propiedad *.receiveShadow*. Sugiero duplicar el código *script_15_luces.js* y renombrar (por ejemplo a *script_15_luces_sombras*), tras esto en el nuevo archivo modifico la función *EsferaPhong* añadiendo un parámetro de entrada, *sombra*, que permite definir si el objeto produce o no sombras.


```
function EsferaPhong(px,py,pz, radio, nx, ny, col, sombra = false) {
  let geometry = new THREE.SphereBufferGeometry(radio, nx, ny)
  //Material con o sin relleno
  let material = new THREE.MeshPhongMaterial({
    color: col
    });

    let mesh = new THREE.Mesh(geometry, material);
    if (sombra) mesh.castShadow = true;
    mesh.position.set(px,py,pz);
    scene.add(mesh)
    objetos.push(mesh)
  }
```

Además de activar la propiedad correspondiente del objeto productor de sombras, también se debe indicar en el *renderer* el cálculo de los mapas de sombras
por medio de la propiedad [*.shadowMap*](https://threejs.org/docs/#api/en/renderers/WebGLRenderer.shadowMap). En la documentación puedes comparar entre los distintos tipos existentes.

```
renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
//Se activan las sombras
renderer.shadowMap.enabled = true;
//renderer.shadowMap.type = THREE.PCFSoftShadowMap; // por defecto THREE.PCFShadowMap
document.body.appendChild( renderer.domElement );
```

Para la escena del ejemplo con tres esferas, interesa definir al menos un objeto que reciba las sombras, es decir, sobre el que se proyecten las mencionadas sombras. Opto por una
caja que haga de suelo, a la que activo dicha característica con la propiedad *.receiveShadow*.

```
//Suelo, para recibir sombras
const SueloGeometry = new THREE.BoxGeometry(10, 0.5, 8);
const SueloMaterial = new THREE.MeshStandardMaterial({ color: 0xfafafa });
const Suelo = new THREE.Mesh(SueloGeometry, SueloMaterial);
Suelo.receiveShadow = true;
Suelo.position.y = -5;
scene.add(Suelo);
```

Faltaría activar la luz o luces que producen sombras, por medio de la propiedad *.castShadow*. El código de la luz direccional y que pueda activarse o no en la interfaz podría quedar algo como:

```
...

//Luz direccional y asistente
const Ldir = new THREE.DirectionalLight(0xffffff, 0.5);
Ldir.position.set(0, 2, 0);
//Sombras
Ldir.castShadow = true;
const LdirHelper = new THREE.DirectionalLightHelper(Ldir, 3);
scene.add(Ldir);
scene.add(LdirHelper);

// Luz direccional GUI
const Ldir_Params = {
  visible: true,
  color: Ldir.color.getHex(),
};
const Ldir_Info = gui.addFolder('luz direccional');
Ldir_Info.add(Ldir_Params, 'visible').onChange((value) => {
  Ldir.visible = value;
  LdirHelper.visible = value;
  });
  Ldir_Info.add(Ldir, 'intensity', 0, 1, 0.25);
  Ldir_Info.add(Ldir.position, 'y', 1, 4, 0.5);
  Ldir_Info.add(Ldir, 'castShadow');
  Ldir_Info
  .addColor(Ldir_Params, 'color')
  .onChange((value) => Ldir.color.set(value));
  Ldir_Info.open();

...
```

Three.js utiliza mapas de sombras, que requieren visualizar la escena desde el punto de vista de cada fuente de luz, suponiendo su utilización por ello un coste importante. Una alternativa podría ser el uso de *sombras falsas*, básicamente texturas. Para mayor información puede serte de interés este [tutorial](https://r105.threejsfundamentals.org/threejs/lessons/threejs-shadows.html).

En mis pruebas con la luz [direccional](https://threejs.org/docs/#api/en/lights/shadows/DirectionalLightShadow) ha sido inmediato el resultado, pero no me se han mostrado evidentes las sombras producidas por luces [focales](https://threejs.org/docs/#api/en/lights/shadows/SpotLightShadow) y [puntuales](https://threejs.org/docs/#api/en/lights/shadows/PointLightShadow), a pesar de estar documentadas.


## Materiales

En ejemplos previos se han mostrado posibilidades de definición de luces, pero no se han descrito las propiedades del material para responder a ellas.
En primer término abordo ejemplos básicos de mapeo de texturas, para posteriormente mencionar brevemente popiedades del material relacionadas con la iluminación.

### Texturas

Recuperamos un ejemplo clásico de reproducción del [planeta Tierra](https://geethujp.github.io/earthModel/index.html), que muestro paso a paso. En mi caso las imágenes han sido tomadas del ejemplo Processing [BlueMarble](https://github.com/codeanticode/pshader-experiments/tree/master/BlueMarble) en el que se consigue similar efecto haciendo uso de *shaders*. Probablemente las texturas utilizadas son las gratuitas disponibles en el repositorio de [texturas de planetas](http://planetpixelemporium.com/planets.html) (algunas de mayor calidad son de pago).

Para abordar las texturas básicas sobre una esfera, haré uso del código *script_21_texplaneta*, en el que modifico la función *Esfera* del ejemplo previo con sombras para que admita como parámetros de entrada varios mapas de texturas, cada uno con un fin determinado. La definición de la escena incluye luz ambiente y direccional.

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

Es importante señalar que con anterioridad deben subirse las imágenes de los mapas de texturas al
 proyecto Glitch a través de la carpeta de *Assets*. Accediendo a dicha carpeta y abriendo una imagen en particular, se obtiene el *url* que proporcionar a la función de carga  *THREE.TextureLoader().load*


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

 En los ejemplos de iluminación se ha hecho uso de objetos creados con [*MeshPhongMaterial*](https://threejs.org/docs/#api/en/materials/MeshPhongMaterial). Hay cuatro propiedades del material que intervieven en el cálculo del color en combinación con las luces definidas


- *.ambient*: Color del material que se combina (producto) con la fuente de luz ambiente. Por defecto es blanco

- *.emissive*:  Color del objeto, no es una fuente de luz. No se ve afectado por la iluminación, por defecto es negro.
- *.specular*:  Define el color del destello, eflejo especular. Si se define con el color del objeto se obtiene un efecto más metálico, si se define gris, más plástico.
- *.shininess*:  This property defines how shiny the specular highlight is. The default
value for the shininess property is 30.


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

Por defecto el puerto de vista del reproductor ocupa toda la ventana de visualización. Para mostrar mútliples vistas de una escena, es posible en la llamada a *renderer*, haber
definido previamente con *setViewport* la zona a ocupar

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

En ejemplo previos se ha introducido *OrbitControl*, dedico unas líneas en este apartado a [*FlyControls*](https://threejs.org/docs/#examples/en/controls/FlyControls) que permite modificar la posición y orientación dela cámara. Com punto de partida, usar por ejemplo *script_25_esferasimple*. En mi máquina he tenido que incluir en *index.html* lo siguiente:

```
<script src="https://threejs.org/examples/js/controls/FlyControls.js"></script>
```

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

Para esta segunda semana, la tarea requiere integrar en el sistema planetario el uso de texturas, poder alternar ( o mostrar de forma simultánea) entre al menos dos cámaras, tener control de cámara (no necesariamente por medio de *FlyControls*) simulando que nos movemos pormedio del sistema planetario en una *nave*.




## Referencias

Referencias que han servido para la confección de los diversos ejemplos:

- [Documentación](https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene)  
- [Discover three.js](https://discoverthreejs.com)
- [Learning Three.js](https://github.com/josdirksen/learning-threejs) por [Jos Dirksen](https://github.com/josdirksen)
- [Three.js Cookbook](https://github.com/josdirksen/threejs-cookbook) por [Jos Dirksen](https://github.com/josdirksen) de 2015


***
Bajo licencia de Creative Commons Reconocimiento - No Comercial 4.0 Internacional
