import * as THREE from "three";

// Fuentes
//https://threejs.org/docs/#manual/en/introduction/Creating-a-scene -->
//Crea el grafo de escena
const scene = new THREE.Scene();
//Define la cámara (fov vertical, aspecto, planos cercano y lejano)
const camera = new THREE.PerspectiveCamera( 75,
				window.innerWidth / window.innerHeight, 0.1, 1000 );

//Reproductor WebGL
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );

//Añade al HTML DOM (Document Object Model) 
document.body.appendChild( renderer.domElement );

//Objeto cubo con una geometría de caja
const geometry = new THREE.BoxGeometry( 1, 1, 2 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cubo = new THREE.Mesh( geometry, material );
//Objeto añadido a la escena
scene.add( cubo );

//Posición de la cámara
camera.position.z = 5;

//Bucle de animación
function animate() {
	//Preparados para el próximo fotograma
	requestAnimationFrame( animate );

	//Modifica posición del cubo con traslación o rotación
	//cubo.position.x += 0.01;
	//Modifica orientación del cubo
	//cubo.rotation.x += 0.01;
	//cubo.rotation.y += 0.01;

	renderer.render( scene, camera );
}
animate();

