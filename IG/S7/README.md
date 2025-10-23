# Luces, sombras y materiales

<!-- ver https://tools.wwwtyro.net/space-3d/index.html#animationSpeed=0&fov=71&nebulae=false&pointStars=true&resolution=4096&seed=5lhg6rsp9wn4&stars=true&sun=false  
https://www.solarsystemscope.com/textures/ -->


[Luces](#luces)  
[Sombras](#sombras)  
[Materiales](#materiales)  
[Puerto de vista](#puerto-de-vista)  
[Control de cámara](#control-de-cámara)  
[Tarea](#tarea)  
[Referencias](#referencias)


Tras la sesión anterior que introducía aspectos básicos de three.js, esta sesión cubre nuevas características que permiten aportar mayor realismo a la escena. Como punto de partida, haremos uso del enlace al [repositorio CodeSandBox](https://codesandbox.io/p/sandbox/ig2526-s7-master-forked-36r8mq)

## Luces

Para introducir los aspectos básicos de iluminación, hago uso del código ejemplo [*script_11_luces.js*](https://github.com/otsedom/otsedom.github.io/blob/main/IG/S7/code/script_11_luces.js), en el que tras un primer vistazo se observa que tiene distintos bloques de código comentados. En su ejecución, de inicio muestra tres esferas con los colores rojo, verde y azul, creadas con la función *Esfera*, que básicamente las define como en los ejemplos de la sesión previa con *MeshBasicMaterial* que colorea el objeto con un color único, o lo muestra en modo alambres. De cara a la integración de la iluminación en la visualización, three.js ofrece distintos materiales:

- [*MeshLambertMaterial*](https://threejs.org/docs/#api/en/materials/MeshLambertMaterial): El modelo de Lambert considera reflexión difusa, no hay destellos como en el caso de objetos metálicos. Poco costoso, y efectivo cuando no se quiere iluminación modelada físicamente.

- [*MeshPhongMaterial*](https://threejs.org/docs/#api/en/materials/MeshPhongMaterial): Adopta el modelo Phong-Blinn para el cálculo de la reflexión. De nuevo es un modelo que no es físicamente real.

- Otros materiales, no abordados en este documento, proporcionan posibilidades avanzadas con mayor realismo físico: [*MeshStandardMaterial*](https://threejs.org/docs/#api/en/materials/MeshStandardMaterial) y su extensión [*MeshPhysicalMaterial*](https://threejs.org/docs/#api/en/materials/MeshPhysicalMaterial).

En los siguientes ejemplos, se adopta el *MeshPhongMaterial*, del que se hace uso en la función *EsferaPhong* del código de [*script_11_luces.js*](https://github.com/otsedom/otsedom.github.io/blob/main/IG/S7/code/script_11_luces.js). Te animo a comentar las referencias a *Esfera* y descomentar las referencias a *EsferaPhong*.

 **¿Qué se ve?**

¿Unos círculos negros?

La razón es que no hay iluminación definida. Descomentando el bloque de código desde el comentario (*//Luz ambiente*) se activa una **luz ambiente** ([AmbientLight](https://threejs.org/docs/#api/en/lights/AmbientLight)) y su interfaz para modificar sus parámetros de color e intensidad. La iluminación de ambiente no tiene definida dirección, e intenta simular la luz que llega a la superficie de los objetos por reflexión difusa tras rebotar en todos los elementos de la escena, aspecto contemplado en los modelos de iluminación/reflexión local únicamente como una constante. En la ejecución, observarán en la parte superior derecha, una pequeña GUI para modificar los parámetros de las luces, basada en [lil-gui](https://lil-gui.georgealways.com), que permite modificar parámetros de las distintas luces que se irán activando.

Si no ha habido ningún percance, el siguiente paso sugerido es descomentar el bloque de la **luz direccional** (*//Luz direccional y asistente*), que crea una luz direccional ([DirectionalLight](https://threejs.org/docs/#api/en/lights/DirectionalLight)) definiendo su color e intensidad. Las luces direccionales se definen localizadas en el infinito, y emiten en una dirección específica.
Por defecto, una luz direccional emite hacia el *(0, 0, 0)*, destino que puede modificarse con la propiedad *target*.
En el código del ejemplo, se crea un asistente *DirectionalLightHelper* que facilita interpretar su dirección de emisión. Como cualquier luz, que no sea de ambiente, afectará a la superficie dependiendo del ángulo entre la normal a la superficie del objeto y la dirección definida para la fuente de luz.

El siguiente bloque a descomentar (*//Luz focal y asistente*) define una **luz focal** ([SpotLight](https://threejs.org/docs/#api/en/lights/SpotLight)) estableciendo una determinada configuración, y fijando a continuación su posición con *.position.set(2, 2, 2);*. Los argumentos descritos en la documentación:

- color: por defecto 0xffffff
- intensidad: fuerza de la luz, por defecto 1
- distancia: rango máximo de la luz. Por defecto 0, no hay límite
- ángulo: ángulo máximo de dispersión de la luz, teniendo como límite máximo &pi;/2
- penumbra: porcentaje del cono atenuado por penumbra, siendo por defecto 0
- decaimiento: atenuación debida a la distancia

El último bloque comentado (*//Luz puntual y asistente*) define una **luz puntual** ([PointLight](https://threejs.org/docs/#api/en/lights/PointLight)), que cuenta con un subconjunto de los parámetros que la focal, en concreto:

- color
- intensidad
- distancia
- decaimiento

Tras descomentar todos los bloques, la mencionada GUI permite modificar algunos de los parámetros de configuración de las distintas luces.

Mencionar, otros dos tipos de luces presentes en three.js:

- Por un lado [HemisphereLight](https://threejs.org/docs/#api/en/lights/HemisphereLight) que define una luz en la parte superior de la escena. Se concibe para dar aspecto más natural a escenas de exteriores donde hay gran dispersión de la luz, sin embargo no puede provocar sombras. Cierto es que aún no las hemos visto para el resto de los tipos de luces. El [ejemplo del flamenco](https://threejs.org/examples/#webgl_lights_hemisphere) ilustra lo que aportan este tipo de luces.

- Por otro lado, están las fuentes de emisión de área rectangular ([RectAreaLight](https://threejs.org/docs/#api/en/lights/RectAreaLight)), que a diferencia de todas las anteriores no son puntuales. Señalar que tampoco tienen soporte para sombras, y que sólo actúan con determinados tipos avanzados de materialas: *MeshStandardMaterial* y *MeshPhysicalMaterial*, además de requerir *THREE.WebGLDeferredRenderer* por temas de eficiencia. En este [enlace](https://threejs.org/examples/#webgl_lights_rectarealight) tienes acceso a un ejemplo ilustrativo de sus posibilidades.

Finalmente indicar que three.js también ofrece cierto soporte para sondas luminosas ([LightProbe](https://threejs.org/docs/#api/en/lights/LightProbe)) que permiten añadir luz a la escena 3D, si bien no emitiendo sino almacenando luz que atraviesa el espacio 3D. Se asocian normalmente a mapas de brillo del entorno. La documentación incluye varios ejemplos.

## Sombras

Si definimos luces, deberían aparecer sus sombras correspondientes. Three.js proporciona soporte para sombras por medio de mapas de sombras, obtenido tras reproducir la escena desde cada fuente de luz. Al no estar activo su cálculo (costoso) por defecto, debe indicarse al definir un objeto si proyecta sombras, propiedad *.castShadow*, y/o si las recibe, propiedad *.receiveShadow*. Sugerir duplicar el código [*script_11_luces.js*](https://github.com/otsedom/otsedom.github.io/blob/main/IG/S7/code/script_11_luces.js) y renombrar (por ejemplo a *script_12_lucesysombras*), tras esto en el nuevo archivo modificar la función *EsferaPhong* añadiendo un nuevo parámetro de entrada, *sombra*, que permitirá definir si el objeto produce o no sombras, activando la propiedad *castShadow*, quedando similar a:


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

Además de activar la propiedad correspondiente del objeto productor de sombras, también se debe indicar en el *renderer* el método aplicado para el cálculo de los mapas de sombras
por medio de la propiedad [*.shadowMap*](https://threejs.org/docs/#api/en/renderers/WebGLRenderer.shadowMap). En la [documentación](https://threejs.org/docs/#api/en/constants/Renderer) y otras fuentes como los tutoriales de [SBCODE](https://sbcode.net/threejs/shadows/) puedes comparar entre los distintos tipos existentes. Para activar las sombras en el *renderer*:

```
renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
//Se activan las sombras
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // por defecto THREE.PCFShadowMap
document.body.appendChild( renderer.domElement );
```

Para la escena del ejemplo con tres esferas, interesa definir al menos un objeto que reciba las sombras, ya que de momento, se ha establecido que las esferas producen sombras, pero ningún objeto ha activado que las reciba. En el ejemplo, se crea una
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

La utilización de mapas de sombras, requiere calcular la escena desde el punto de vista de cada fuente de luz, supone un coste importante. Dado que en ocasiones puede no merecer la pena, una alternativa podría ser el uso de *sombras falsas*, básicamente texturas. Para mayor información puede serte de interés este [tutorial](https://r105.threejsfundamentals.org/threejs/lessons/threejs-shadows.html).

Con la luz [direccional](https://threejs.org/docs/#api/en/lights/shadows/DirectionalLightShadow), el efecto de las sombras es inmediato visualmente. Con luces [puntuales](https://threejs.org/docs/#api/en/lights/shadows/PointLightShadow) y [focales](https://threejs.org/docs/#api/en/lights/shadows/SpotLightShadow), la sombra producida es más sutil y puede hasta pasar desapercibida por la intensidad de las otras luces, la propia intensidad de la fuente, su distancia máxima de influencia, atenuación, etc.

## Materiales

En ejemplos previos se han mostrado posibilidades de definición de luces, pero no se han descrito las propiedades del material para responder a ellas.
En este apartado se presentan ejemplos básicos de mapeo de texturas, para posteriormente describir brevemente propiedades del material relacionadas con la iluminación.

### Texturas básicas

Como ejemplo básico de mapeo de texturas, el ejemplo [*script_13_texturabasica.js*](https://github.com/otsedom/otsedom.github.io/blob/main/IG/S7/code/script_13_texturabasica.js) ilustra el uso de la propiedad al material *texture* del material para especificar la textura previamente cargada a través de llamadas a *TextureLoader*. Es importante señalar que con anterioridad deben subirse las imágenes de los mapas de texturas al
 proyecto, en mi caso las he colocado en la carpeta *src*. la ruta se le proporciona a la función de carga *THREE.TextureLoader().load* par acada textura.
 Las funciones de creación de esferas y cubos se han modificado para en caso de estar presente el parámetro en la llamada, asignar su valor a la propiedad:


```
const tx1 = new THREE.TextureLoader().load("src/earthmap1k.jpg");

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

En ambos casos se utiliza *MeshBasicMaterial*, recordar que si requiere usar la iluminación, se hará uso *MeshPhongMaterial* o similar, debiendo definirse las luces. Tener presente, que el color del objeto afecta al color visto de la textura.


Si se tiene interés en tener transparencias, será necesario definir un mapa de transparencias con valores *alpha* adecuados para los píxeles transparentes. Además de definir el mapa a través de la propiedad *alphaMap*,en el ejemplo de creación de cubos con textura con transparencias, también se establece la propiedad *transparent* a verdadero, además de la propiedad *side* a *DoubleSide*, que permite ver la textyura por ambas caras. Además se puede jugar con la opacidad con la propiedad *opacity*.

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

Mencionar un par de ejemplos para hacer uso de una textura de vídeo, tomada desde la [cámara web](https://threejs.org/examples/?q=webcam#webgl_materials_video_webcam), o el uso de [un lienzo para tener una textura dinámica](https://threejs.org/examples/?q=canvas#webgl_materials_texture_canvas).


### Un modelo de planeta tierra

Recuperamos un ejemplo clásico de reproducción del [planeta Tierra](https://geethujp.github.io/earthModel/index.html), que muestra paso a paso los elementos que integra. En este caso concreto, las imágenes han sido tomadas del ejemplo de Processing [BlueMarble](https://github.com/codeanticode/pshader-experiments/tree/master/BlueMarble) en el que se consigue similar efecto haciendo uso de *shaders*. Probablemente las texturas utilizadas son las gratuitas disponibles en el repositorio de [texturas de planetas](http://planetpixelemporium.com/planets.html) (algunas con mayor calidad son de pago).

Para ilustrar el modelado del planeta, parto del código [*script_15_texplaneta.js*](https://github.com/otsedom/otsedom.github.io/blob/main/IG/S7/code/script_15_texplaneta.js), en el que se modifica la función *Esfera* del ejemplo previo con un material que calcule la iluminación, *MeshPhongMaterial*, además de admitir como parámetros de entrada varios mapas de texturas, cada uno con un fin determinado. La definición de la escena incluye luz ambiente y direccional.

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

La definición de parámetros incluye hasta cinco mapas de texturas, su presencia o no, forzará que se modifiquen propiedades del material. En este sentido, si no se pasan parámetros de textura, tendremos una esfera iluminada. Reiterar que los mapas de texturas se deben cargar previamente, en el código ejemplo las cinco texturas se cargan en las líneas:

```
//De la superficie
const tx1 = new THREE.TextureLoader().load("src/earthmap1k.jpg");
const txb1 = new THREE.TextureLoader().load("src/earthbump1k.jpg");
const txspec1 = new THREE.TextureLoader().load("src/earthspec1k.jpg");
//Capa de nubes
const tx2 = new THREE.TextureLoader().load("src/earthcloudmap.jpg");
const txalpha2 = new THREE.TextureLoader().load("src/earthcloudmaptrans_invert.jpg");
```

Recordar que con anterioridad deben subirse las imágenes de los mapas de texturas al proyecto.

El primer paso en la reproducción del planeta, adopta una textura difusa que se asigna a la propiedad *.map* cuando el parámetro esté presente.


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

El material puede definir un mapa de rugosidad, especificado a través de la propiedad *.bumpMap*, que puede pesarse con la propiedad *.bumpScale*. Tener en cuenta que no modifica la geometría, solo la iluminación, que en el ejemplo es resultado de una luz direccional que evidencia la influencia del efecto. Sin esta luz, no habrá efecto de rugosidad.


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

Como curiosidades adicionales, mencionar los ejemplos de [*PointMaterial*](https://threejs.org/docs/#api/en/materials/PointsMaterial), y  un ejemplo de [destello de lente](https://threejs.org/docs/#examples/en/objects/Lensflare) basado en textura.


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

 En los ejemplos de iluminación se ha hecho uso de objetos creados con [*MeshPhongMaterial*](https://threejs.org/docs/#api/en/materials/MeshPhongMaterial). Hay cuatro propiedades del material que intervienen en el cálculo del color en combinación con las luces definidas:

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

Por defecto el puerto de vista del reproductor ocupa toda la ventana de visualización. Para mostrar múltiples vistas de una escena,  pudiendo corresponder cada una a una cámara, es posible en la llamada a *renderer*, definir previamente con *setViewport* la zona a ocupar:

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

**¿Te atreves a montar un ejemplo con las tres vistas (*xy*, *yz* y *xz*)?**
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

En ejemplo previos se ha introducido *OrbitControl*, dedico unas líneas en este apartado a [*FlyControls*](https://threejs.org/docs/#examples/en/controls/FlyControls) que permite modificar la posición y orientación de la cámara. Como punto de partida, usar por ejemplo [*script_16_esferasimple*](https://github.com/otsedom/otsedom.github.io/blob/main/IG/S7/code/script_16_esferasimple.js). Tras incluir el correspondiente *import*, se define la variable y su configuración *init* espccificando la cámara que afectará y las propiedades de cambio del control, además de un tiempo inicial, *t0*:

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



## Tarea sistema planetario

La tarea propuesta pide crear un sistema planetario con al menos cinco planetas y alguna luna, integrando iluminación y texturas. La vista del sistema solar permitirá alternar o mostrar al menos dos vistas: vista general y vista subjetiva desde una *nave*. 
La entrega se realizará a través del campus virtual por medio de un **enlace github**, que incluya además del código llevado a cabo un README descriptivo con enlace al repositorio de codesandbox. Penalizará:
- No incluir en el README una descripción de trabajo realizado
- No incluir al menos un vídeo de captura de ejecución de la tarea llevada a cabo


Entre posibles extras para subir nota:
- Una descripción didáctica y visual de la tarea realizada
- Enriquecer el resultado desde un punto de vista didáctico para público general
- Incluir autoría en el vídeo de captura
- Interfaz autocompleta, no siendo necesario acceder a documentación para manejarla
- Poder modificar el punto de vista de la *nave* de forma interactiva
- Poder generar o borrar nuevos planetas o astros de forma interactiva tras la etapa inicial
- Poder hacer uso del control de transformación sobre la localización de los planetas creados [TransformControls](https://threejs.org/docs/#examples/en/controls/TransformControls)


Ejemplos de compañeros de cursos previos, que pueden mostrarles objetivos a alcanzar:

- Una propuesta de sistema solar, no realizado con three.js sino con [Processing](https://processing.org), es el [prototipo de Gabriel García Buey](https://github.com/CaptainChameleon/PocketPlanetarium)
- Un extracto del trabajo realizado por [Agustín Vizcaíno González](https://alumnosulpgc-my.sharepoint.com/:v:/g/personal/mcastrillon_iusiani_ulpgc_es/EdQU5_NpmjhEoHO9I_fOc54BADWzRxdLTeohHFeaLA8sVA?e=k5g3Dw)


## Referencias

Referencias que han servido para la confección de los diversos ejemplos:

- [Documentación](https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene)  
- [Discover three.js](https://discoverthreejs.com)
- [Three.js Textures](https://r105.threejsfundamentals.org/threejs/lessons/threejs-textures.html)
- [Learning Three.js](https://github.com/josdirksen/learning-threejs) por [Jos Dirksen](https://github.com/josdirksen)
- [Three.js Cookbook](https://github.com/josdirksen/threejs-cookbook) por [Jos Dirksen](https://github.com/josdirksen) de 2015


***
Bajo licencia de Creative Commons Reconocimiento - No Comercial 4.0 Internacional
