import * as THREE from "three";
import TWEEN from 'https://cdn.jsdelivr.net/npm/@tweenjs/tween.js@18.5.0/dist/tween.esm.js'

let scene, renderer;
let camera;
let objetos = [];

init();
animationLoop();

function init() {
  //Cámara
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
  // Un único twwen
  const tween1 = new TWEEN.Tween({ x: -4.0})
    .to({ x: 0. }, 2000)
    .onUpdate((coords) => {
      tomove.position.x = coords.x;     
    })
    .easing(TWEEN.Easing.Exponential.InOut)
    .delay(100)
    .repeat(5);
  
  //Dos tweens encadenados
  /*const tween1 = new TWEEN.Tween({ x: -4.0 , y: 0, angx: 0})
    .to({ x: 0. , y: -2, angx: Math.PI / 2}, 2000)
    .onUpdate((coords) => {
      tomove.position.x = coords.x;  
      tomove.position.y = coords.y;  
      tomove.rotation.x = coords.angx;
    })
    .easing(TWEEN.Easing.Exponential.InOut)
    .delay(100)
    .repeat(Infinity);
  const tween2 = new TWEEN.Tween({ x: 0.0 , y: -2, angx: Math.PI / 2})
    .to({ x: -4. , y: 0, angx: 0}, 2000)
    .onUpdate((coords) => {
      tomove.position.x = coords.x;  
      tomove.position.y = coords.y;  
      tomove.rotation.x = coords.angx;
    })
    .easing(TWEEN.Easing.Exponential.InOut)
    .delay(100)
    //.repeat(Infinity);
  
  tween1.chain(tween2);
  tween2.chain(tween1);*/
 
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
