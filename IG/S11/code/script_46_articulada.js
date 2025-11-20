import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as TWEEN from "@tweenjs/tween.js";

let scene, renderer;
let camera, grid;
let camcontrols;
let links = [],
  artis = [];
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
  camera.position.set(0, 10, 15);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camcontrols = new OrbitControls(camera, renderer.domElement);

  //Rejilla de referencia en suelo
  grid = new THREE.GridHelper(20, 40);
  scene.add(grid);

  //Objetos
  const robot = createBrazo();
  scene.add(robot);

  // Define keyframes y propiedades a interpolar
  const tween1 = new TWEEN.Tween({ y: 0 })
    .to({ y: 1 }, 2000)
    .onUpdate((coords) => {
      links[0].position.y = coords.y;
    })
    .easing(TWEEN.Easing.Exponential.InOut)
    .delay(100);

  const tween2 = new TWEEN.Tween({ angy: 0 })
    .to({ angy: -Math.PI }, 3000)
    .onUpdate((coords) => {
      links[1].rotation.y = coords.angy;
    })
    .easing(TWEEN.Easing.Exponential.InOut)
    .delay(100);

  const tween3 = new TWEEN.Tween({ angz: 0 })
    .to({ angz: Math.PI / 4 }, 2000)
    .onUpdate((coords) => {
      artis[0].rotation.z = coords.angz;
    })
    .easing(TWEEN.Easing.Exponential.InOut)
    .delay(100);

  const tween4 = new TWEEN.Tween({ angz: Math.PI / 4 })
    .to({ angz: 0 }, 2000)
    .onUpdate((coords) => {
      artis[0].rotation.z = coords.angz;
    })
    .easing(TWEEN.Easing.Exponential.InOut)
    .delay(100);

  const tween5 = new TWEEN.Tween({ angy: -Math.PI })
    .to({ angy: 0 }, 3000)
    .onUpdate((coords) => {
      links[1].rotation.y = coords.angy;
    })
    .easing(TWEEN.Easing.Exponential.InOut)
    .delay(100);

  const tween6 = new TWEEN.Tween({ y: 1 })
    .to({ y: 0 }, 2000)
    .onUpdate((coords) => {
      links[0].position.y = coords.y;
    })
    .easing(TWEEN.Easing.Exponential.InOut)
    .delay(100);

  //.repeat(Infinity);

  tween1.chain(tween2);
  tween2.chain(tween3);
  tween3.chain(tween4);
  tween4.chain(tween5);
  tween5.chain(tween6);
  tween6.chain(tween1);

  tween1.start();
}

function createBrazo() {
  const blue_mat = new THREE.MeshBasicMaterial({
    color: 0x11118b,
    metalness: 1,
    roughness: 0.4,
  });
  const gris_mat = new THREE.MeshBasicMaterial({
    color: 0x756c6a,
    metalness: 1,
    roughness: 0.4, //, wireframe: true
  });
  const naranja_mat = new THREE.MeshBasicMaterial({
    color: 0xe55c08,
    metalness: 1,
    roughness: 0.4,
  });

  //Plataforma
  //const base_geometry = new THREE.CylinderGeometry(2.5, 2.5, 2, 32);
  const plata_geometry = new THREE.BoxGeometry(5, 1.5, 5);
  const plataforma = new THREE.Mesh(plata_geometry, blue_mat);
  plataforma.position.set(0, 0.75, 0);

  //link 1 desplazamiento traslacional
  const naranja_base_geometry = new THREE.CylinderGeometry(1.5, 1.5, 2, 32);
  const naranja_base = new THREE.Mesh(naranja_base_geometry, gris_mat);
  naranja_base.position.set(0, 0.01, 0);
  plataforma.add(naranja_base);
  links.push(naranja_base);

  //link 2 rotacional
  const arm_geometry1 = new THREE.BoxGeometry(1, 4, 1);
  const naranja_arm1 = new THREE.Mesh(arm_geometry1, naranja_mat);
  //Posición
  naranja_arm1.position.set(0, 3, 0); //Base más mitad del elemento
  naranja_base.add(naranja_arm1);
  links.push(naranja_arm1);

  //articulación rotacional entre link 2 y 3, pivote y esfera
  var pivote = new THREE.Object3D();
  pivote.position.set(0, 2.5, 0); //Base más mitad del elemento
  naranja_arm1.add(pivote);
  artis.push(pivote);

  //Objeto esfera
  const arti_geometry = new THREE.SphereBufferGeometry(1, 30, 10);
  const arti_23 = new THREE.Mesh(arti_geometry, gris_mat);
  pivote.add(arti_23);

  //link 3 rotacional
  const arm_geometry2 = new THREE.BoxGeometry(1, 4, 1);
  const naranja_arm2 = new THREE.Mesh(arm_geometry2, naranja_mat);
  //Posición y orientación
  naranja_arm2.position.set(2.5, 0, 0);
  naranja_arm2.geometry.rotateZ(Math.PI / 2);
  arti_23.add(naranja_arm2);
  links.push(naranja_arm2);

  return plataforma;
}

//Bucle de animación
function animationLoop() {
  requestAnimationFrame(animationLoop);

  TWEEN.update();

  renderer.render(scene, camera);
}
