import * as THREE from "three";

// Fuentes
//https://threejs.org/docs/#manual/en/introduction/Creating-a-scene -->
// https://r105.threejsfundamentals.org/threejs/lessons/threejs-primitives.html  -->
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
//Posición de la cámara
camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//Objeto esfera (radio, eltos ancho, eltos alto)
const geometry = new THREE.SphereBufferGeometry(2, 10, 10);
//Material relleno (z-buffer) o alambres
const material = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  wireframe: true, //Descomentar para activar modelo de alambres
});

//Malla resultante
const esfera = new THREE.Mesh(geometry, material);
//Se añade al grafo de escena
scene.add(esfera);

//Coloca la esfera en el espacio
//esfera.position.set(2,3,0);

//Bucle de animación
function animate() {
  requestAnimationFrame(animate);

  //Modifica rotación de la esfera
  //esfera.rotation.x += 0.01;
  //esfera.rotation.z += 0.01;
  esfera.rotation.y += 0.01;

  renderer.render(scene, camera);
}

animate();
