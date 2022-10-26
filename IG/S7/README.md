# Un sistema planetario

[Rotaciones arbitrarias](#rotaciones-arbitrarias)  
[Luces](#luces)  
[Tarea](#tarea)  
[Referencias](#referencias)


## Rotaciones arbitrarias

Tras la sesión anterior que introducía aspectos básicos de three.js, en esta sesión práctica, se parte de un ejemplo básico que integra varios de los elementos abordados en la semana anterior para dibujar una esfera, que en el servidor Glitch, se corresponde con el archivo *script_11_esfera*:

```
let scene, renderer;
let camera;
let info;
let grid;
let camcontrols1;
let objetos = [];

init()
animationLoop()

function init() {
	info = document.createElement('div');
	info.style.position = 'absolute';
	info.style.top = '30px';
	info.style.width = '100%';
	info.style.textAlign = 'center';
	info.style.color = '#fff';
	info.style.fontWeight = 'bold';
	info.style.backgroundColor = 'transparent';
	info.style.zIndex = '1';
	info.style.fontFamily = 'Monospace';
	info.innerHTML = "three.js - esfera";
	document.body.appendChild(info);

	//Defino cámara
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
	camera.position.set(0, 0, 10);

	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	camcontrols1 = new THREE.OrbitControls(camera, renderer.domElement);

	//Rejilla de referencia indicando tamaño y divisiones
	grid = new THREE.GridHelper(20, 40);
	//MOstrarla en vertical
	grid.geometry.rotateX( Math.PI / 2 );
	grid.position.set(0, 0, .05);
	scene.add(grid);

	//Objetos
	Esfera(0,0,0,0.8,10,10, 0xffff00);
}

function Esfera(px,py,pz, radio, nx, ny, col) {
	let geometry = new THREE.SphereBufferGeometry(radio, nx, ny)
	//Material con o sin relleno
	let material = new THREE.MeshBasicMaterial({
		color: col,
		wireframe: true, //Descomenta para activar modelo de alambres
		});

		let mesh = new THREE.Mesh(geometry, material)
		mesh.position.set(px,py,pz);
		scene.add(mesh)
		objetos.push(mesh)
	}

	//Bucle de animación
	function animationLoop() {
		requestAnimationFrame(animationLoop);

		//Modifica rotación de todos los objetos
		for(let object of objetos) {
			object.rotation.y += 0.01;
		}

		renderer.render( scene, camera );		
	}
```

Para crear una segunda esfera, al disponer de la función *Esfera* basta con
añadir una nueva llamada en el código, pudiendo quedar algo como:

```
//Objetos
Esfera(0,0,0,0.8,10,10, 0xffff00);
Esfera(3,0,0,0.4,10,10, 0x00ffff);
```

En el bucle de isualización, se aplica una rotación a cada objeto presente en el vector *objetos*, en el que se añaden las esferas creadas en la función *Esfera*. Por ese motivo ambas esferas aparecen rotando.

Cada esfera rota sobre su centroide. **¿Cómo conseguir que la segunda esfera rote alrededor de la primera, como si fueran una estrella
y el planeta en su órbita?**

Mi primera propuesta consiste en crear una nueva función *EsferaChild* donde la nueva malla no se asocia directamente a la escena sino a la malla suministrada como parámetro (en mi caso, la *estrella*).
Con esta acción hago uso del grafo de escena, y ocurre que todas las transformaciones aplicadas sobre el ancestro, el padre, se aplican también al amatriz de transformación de sus herederos.

La información sobre el padre de un objeto se conoce a través de la propiedad *.parent*. Tener presente que un objeto sólo puede tener un padre. En el contexto del [grafo de escena](https://r105.threejsfundamentals.org/threejs/lessons/threejs-scenegraph.html) se establecen dependencias en una estructura jerárqiuica entre objetos.

```
//Modifico en la función init
//sol
Esfera(0,0,0,0.8,10,10, 0xffff00);
//planeta
EsferaChild(objetos[0],2.5,0,0,0.4,10,10, 0x0000ff);

...

//Defino la nueva función que recibe al padre como argumento de entrada
function EsferaChild(padre,px,py,pz, radio, nx, ny, col) {
	let geometry = new THREE.SphereBufferGeometry(radio, nx, ny)
	let material = new THREE.MeshBasicMaterial({
					color: col,
					wireframe: true, //Descomenta para activar modelo de alambres
				  });

	let mesh = new THREE.Mesh(geometry, material)
	mesh.position.set(px,py,pz);
	padre.add(mesh)
	objetos.push(mesh)
}
```				

El resultado obtenido con esta propuesta para la segunda esfera es una rotación aldededor del padre y autorotación. Sin embargo, el planeta no se desliga de la rotación de la *estrella*. Actúa como un satélite artificial geoestacionario que rota solidariamente con la rotación aplicada al padre.

Una solución para desligar ambas rotaciones es calcular *a pelo* la rotación del planeta en función del tiempo, y consecuentemente actualizar la posición de la esfera. Opto por trabajar en rotación sobre *z* para los ejemplos, que modifica las coordenadas *x* e *y*. Recordando la rotación en 2D como muestra la imagen.

![Rotation](images/rotacion.png)  
*Rotación 2D*

Restructuro el código creando una función para crear estrellas (*creaEstrella*) y otra para crear planetas (*creaPlaneta*), a los que puedo proporcionar parámetros
de distancia a la estrella, tamaño y velocidad de rotación alrededor de su estrella, que se asocian al objeto a través de *userData*. Mi planeta inicialmente estará en la posición *(dist,0,0)* por lo que la transformación es más sencilla, dado que al rotar sobre *z* el valor de *y* de partida es nulo. Asumiendo un ángulo inicial de rotación nulo, &theta;=0
, creciente en función del tiempo, *x=dist * cos &theta;* e *y = dist * sen &theta;*

```
//nuevas variables
let Sol, Planetas = [], Lunas = [];
let t0 = 0;
let accglobal = 0.001; //tic de tiempo

...

//En init()
//Objeto estrella
creaEstrella(1.0, 0xffff00);

//Planetas con órbitas circulares
creaPlaneta(0.2,3,2,0x0000ff);

//Inicio tiempo
t0 = Date.now();

...

//Nuevas funciones			
function creaEstrella(rad,col) {
	let geometry = new THREE.SphereGeometry( rad, 10, 10 );
	let material = new THREE.MeshBasicMaterial( { color: col } );
	estrella = new THREE.Mesh( geometry, material );
	scene.add( estrella );
}

function creaPlaneta(radio, dist, vel, col) {
	let geom = new THREE.SphereGeometry(radio, 10, 10);
	let mat = new THREE.MeshBasicMaterial({ color: col});
	let planeta = new THREE.Mesh(geom, mat);
	planeta.userData.dist = dist;
	planeta.userData.speed = vel;

	Planetas.push(planeta);
	scene.add(planeta);
};

...
//En el bucle de visualización
timestamp = (Date.now() - t0) * accglobal;

//Modifica posición de cada planeta
Planetas.forEach(function(planeta) {
	planeta.position.x = Math.cos(timestamp * planeta.userData.speed) * planeta.userData.dist;
	planeta.position.y = Math.sin(timestamp * planeta.userData.speed) * planeta.userData.dist;
	});			
```

Tras estas acciones se obtiene un planeta que rota alrededor de una estrella, sin que los movimientos de ambos objetos estén acoplados. Dado que no necesariamente las
 las órbitas son circulares, añado en la creación del planeta como parámetros los radios de la órbita elíptica:


```
//En init
//Planetas con órbitas circulares o elípticas
creaPlaneta(0.2,3,2,0x0000ff, 1.0, 1.2);
creaPlaneta(0.15,5,1.4,0xff0ff0, 1.9, 1.1);
...

//Las funciones
//Si f1==f2 será una órbita circular, si es 1, como ejemplo previo
function creaPlaneta(radio, dist, vel, col, f1, f2) {
	let geom = new THREE.SphereGeometry(radio, 10, 10);
	let mat = new THREE.MeshBasicMaterial({ color: col});
	let planeta = new THREE.Mesh(geom, mat);
	planeta.userData.dist = dist;
	planeta.userData.speed = vel;
	//radios de la elipse
	planeta.userData.f1 = f1;
	planeta.userData.f2 = f2;

	Planetas.push(planeta);
	scene.add(planeta);
};

...

//En el bucle de visualización
//Modifica posición de cada planeta
Planetas.forEach(function(planeta) {
	planeta.position.x = Math.cos(timestamp * planeta.userData.speed) * planeta.userData.f1 * planeta.userData.dist;
	planeta.position.y = Math.sin(timestamp * planeta.userData.speed) * planeta.userData.f2 * planeta.userData.dist;
	});			

```

Para dibujar la trayectoria del planeta propongo hacer uso de la curva elíptica (*EllipseCurve*) en la propia funciónd e creación del planeta. De tal forma que simplemente se define con los parámetros asociados al planeta en  *creaPlaneta* y se añade el objeto a la escena.
En este ejemplo se asume que la trayectoria elíptica es alrededor del origen, viniendo los radios de la elipse definidos por la distancia y peso de cada uno.

```
function creaPlaneta(radio, dist, vel, col, f1, f2) {
	let geom = new THREE.SphereGeometry(radio, 10, 10);
	let mat = new THREE.MeshBasicMaterial({ color: col});
	let planeta = new THREE.Mesh(geom, mat);
	planeta.userData.dist = dist;
	planeta.userData.speed = vel;
	//radios de la elipse
	planeta.userData.f1 = f1;
	planeta.userData.f2 = f2;

	Planetas.push(planeta);
	scene.add(planeta);

	//Dibuja trayectoria, con
	let curve = new THREE.EllipseCurve(
		0,  0,            		// centro
		dist*f1, dist*f2        // radios elipse
		);
		//Crea geometría
		let points = curve.getPoints( 50 );
		let geome = new THREE.BufferGeometry().setFromPoints( points );
		let mate = new THREE.LineBasicMaterial( { color: 0xffffff } );
		// Objeto
		let orbita = new THREE.Line( geome, mate );
		scene.add(orbita);
	};
```

Si interesara añadir satélites a los planetas, realizar el cálculo de las posiciones es posible, pero es engorroso, resulta en este caso más cómodo aprovechar el grafo de escena, asociando cada satélite o luna a su planeta.

```
//En init()
creaPlaneta(0.2,3,2,0x0000ff, 1.0, 1.2);
creaPlaneta(0.15,5,1.4,0xff0ff0, 1.9, 1.1);

creaLuna(Planetas[0],0.05,0.5,-3.5,0xffff00);

...

function creaLuna(planeta, radio, dist, vel, col) {				
	var geom = new THREE.SphereGeometry(radio, 10, 10);
	var mat = new THREE.MeshBasicMaterial({ color: col});
	var luna = new THREE.Mesh(geom, mat);
	luna.userData.dist = dist;
	luna.userData.speed = vel;

	Lunas.push(luna);
	planeta.add(luna);
};

...

//En bucle de visualización
//Modifica posición de cada luna
Lunas.forEach(function(luna) {
	luna.position.x = Math.cos(timestamp * luna.userData.speed) * luna.userData.dist;
	luna.position.y = Math.sin(timestamp * luna.userData.speed) * luna.userData.dist;
	});

```

El uso de un pivote intermedio aporta mayor flexibilidad,
por ejemplo permitir que cada órbita lunar esté en un plano distinto.

```
//En init
creaPlaneta(0.2,3,2,0x0000ff, 1.0, 1.2);
creaPlaneta(0.15,5,1.4,0xff0ff0, 1.9, 1.1);

creaLuna(Planetas[0],0.05,0.5,-3.5,0xffff00, 0.0);
creaLuna(Planetas[0],0.04,0.7,1.5,0xff0f00, Math.PI / 6);
...

function creaLuna(planeta, radio, dist, vel, col, angle) {				
	var pivote = new THREE.Object3D();
	pivote.rotation.x = angle;
	planeta.add(pivote);
	var geom = new THREE.SphereGeometry(radio, 10, 10);
	var mat = new THREE.MeshBasicMaterial({ color: col});
	var luna = new THREE.Mesh(geom, mat);
	luna.userData.dist = dist;
	luna.userData.speed = vel;

	Lunas.push(luna);
	pivote.add(luna);
};
```


## Luces

Para introducir los aspectos básicos de iluminación, hago uso del código del ejemplo *script_15_luces.js*. Dado que hace uso de *dat.gui*, he añadido el archivo *dat.gui.js* en el repositorio Glitch, además de incluir en *index.html*

```
<script src="dat.gui.js"></script>
```

El código tiene distintos elementos comentados, por defecto muestra tres esferas con los colores rojo , verde y azul creando los objetos con la función *Esfera*, que básicamente las define como hasta ahora con *MeshBasicMaterial*.
De cara a la integración de la iliuminación, threejs ofrece:

- *MeshLambertMaterial*: El modelo de Lambert, que básicamente considera reflexión difusa. Efectivo cuando no se quiere iluminación modelada físicamente.

- *MeshPhongMaterial*: Adopta el modelo Phong-Blinn para el cálculo de la reflexión. De nuevo es un modelo que no es físicamente real.

- *MeshPhysicalMaterial*: Proporciona posibilidades avanzadas con mayor realismo físico. No se trata en esta sesión.

Para este ejemplo se adopta el *MeshPhongMaterial*, del que se hace uso en la función *EsferaPhong*. Te animo a comentar las referencias a *Esfera* y descomentar las referencias a  *EsferaPhong*. **¿Qué se ve?**

¿Unos círculos negros? La razón es que no hay iluminación definida. Descomentando el bloque de código desde el comentario *//Luz ambiente* se activa una luz ambiente ([AmbientLight](https://threejs.org/docs/#api/en/lights/AmbientLight)) y su interfaz para modificar sus parámetros de color e intensidad. La iluminación de ambiente no tiene definida dirección, e intenta simular la luz que llega a la superficie de los objetos por reflexión difusa de la luz tras rebotar en todos los elementos de la escena, aspecto no contemplado en los modelos de iluminación/reflexión local.

Si no ha habido ningún percance, el siguiente paso es descomentar el bloque de la luz direccional *//Luz direccional y asistente* que crea una luz direccional ([DirectionalLight](https://threejs.org/docs/#api/en/lights/DirectionalLight))  definiendo su color e intensidad. Las luces direccionales se definen localizadas en el infinito, y emiten en una dirección específica.
Por defecto emiten hacia el *(0, 0, 0)*, punto que puede modificarse con la propiedad *target*.
En el código, se crea un asistente *DirectionalLightHelper* que facilita interpretar su dirección de emisión. Como cualquier luz, que no sea de ambiente, afectará a la superficie dependiendo del ángulo entre la normal a la superficie del objeto y la dirección de la fuente de luz.


El siguiente bloque a descomentar (*//Luz focal y asistente*) define una luz focal ([SpotLight](https://threejs.org/docs/#api/en/lights/SpotLight)) estableciendo una determinada configuración, y fijando a continuación su posición con *.position.set(2, 2, 2);*. Los argumentos descritos en la documentación:

- color: por defecto 0xffffff
- intensidad: fuerza de la luz, por defecto 1
- distancia: rango máximo de la luz. Por defecto 0, no hay límite
- ángulo: ángulo máximo de dispersión de la luz, teniendo comolímite máximo &pi;/2.
- penumbra: porcentaje del cono ateuado por penumbra, siendo por defecto 0
- decaimiento: atenuación debida a la distancia

El último bloque comentado *//Luz puntual y asistente* define una luz puntual ([PointLight](https://threejs.org/docs/#api/en/lights/PointLight)), que cuenta con un subconjunto de los parámetros que la focal, en concreto:

- color
- intensidad
- distancia
- decaimiento

Una vez descomentados todos los bloques, la correspondiente GUI permite modificar algunos de sus parámetros de configuración.

Mencionar, in ir más allá, otros dos tipos de luces presentes en three.js.
Por un lado [HemisphereLight](https://threejs.org/docs/#api/en/lights/HemisphereLight) que define una luz en la parte superior de la escena. Sin embargo no puede provocar sombras. Cierto es que aún no las hemosvisto para el resto de los tipos de luces (será la próxima semana). El [ejemplo del flamenco](https://threejs.org/examples/#webgl_lights_hemisphere) da una visión sobre lo que aportan este tipo de luces.

Por otro lado están las fuentes de emisión de área rectangular ([RectAreaLight](https://threejs.org/docs/#api/en/lights/RectAreaLight)), que a diferencia de todas las anteriores no son puntuales. Señalar que tampoco tienen soporte para sombras, y que sólo actúan con *MeshStandardMaterial* y *MeshPhysicalMaterial*. Un [ejemplo ilustrativo](https://threejs.org/examples/#webgl_lights_rectarealight) de sus posibilidades.

Finalmente indicar que three.js también ofrece cierto soporte para sondas luminosas ([LightProbe](https://threejs.org/docs/#api/en/lights/LightProbe)) que permiten añadir luz a la escena 3D, si bien no emitiendo sino almacenando luz que atraviesa el espacio 3D. Se asocian normalmente a mapas de brillo del entorno. La documentación incluye varios ejemplos.


## Tarea

Crear un prototipo que muestre un sistema planetario en movimiento que incluya una estrella, al menos cinco planetas y no menos de dos lunas,. Valorar que exista algún tipo de interacción.

Indicar que al menos durante una semana más se seguirá trabajando en el prototipo, por lo que si tienen tiempo y curiosidad pueden explorar las propiedades del material [MeshPhongMaterial](https://threejs.org/docs/#api/en/materials/MeshPhongMaterial).

Aunque no haya sido realIzado con three.js sino con [Processing](https://processing.org) el [prototipo de Gabriel García Buey](https://github.com/CaptainChameleon/PocketPlanetarium) puede dar inspiración.


## Referencias

Referencias que han servido para la confección de los diversos ejemplos:

- [Documentación](https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene)  
- [Discover three.js](https://discoverthreejs.com)
- [Learning Three.js](https://github.com/josdirksen/learning-threejs) por [Jos Dirksen](https://github.com/josdirksen)
- [Three.js Cookbook](https://github.com/josdirksen/threejs-cookbook) por [Jos Dirksen](https://github.com/josdirksen) de 2015


***
Bajo licencia de Creative Commons Reconocimiento - No Comercial 4.0 Internacional
