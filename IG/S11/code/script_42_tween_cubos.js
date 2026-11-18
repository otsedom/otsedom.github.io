import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";

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
  let px = -5;
  let ite;
  Cubo(px, 0, 0, 0.9, 0.9, 0.9);
  Cubo(px + 1, 0, 0, 0.9, 0.9, 0.9);
  Cubo(px + 2, 0, 0, 0.9, 0.9, 0.9);
  Cubo(px + 3, 0, 0, 0.9, 0.9, 0.9);

  // Encadena tweens
  const tween1 = new TWEEN.Tween({ x: 0, xRotation: 0, col: 0xffff00 })
    .to({ x: 3, xRotation: Math.PI / 2, col: 0xffffff }, 2000)
    .onUpdate((coords) => {
      let idx = 0;
      for (let object of objetos) {
        object.position.x = px + idx + coords.x;
        //Rota uno de cada dos
        if (THREE.MathUtils.euclideanModulo(idx, 2) == 1)
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
    .repeat(5);

  tween1.start();
}

function Cubo(px, py, pz, sx, sy, sz) {
  let geometry = new THREE.BoxBufferGeometry(sx, sy, sz);
  //Material con o sin relleno
  let material = new THREE.MeshNormalMaterial({
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
