import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'


let scene, renderer;
let camera;
let info;
let grid;
let camcontrols1;
let objetos = [];

init();
animationLoop();

function init() {
  info = document.createElement("div");
  info.style.position = "absolute";
  info.style.top = "30px";
  info.style.width = "100%";
  info.style.textAlign = "center";
  info.style.color = "#fff";
  info.style.fontWeight = "bold";
  info.style.backgroundColor = "transparent";
  info.style.zIndex = "1";
  info.style.fontFamily = "Monospace";
  info.innerHTML = "three.js - texturas";
  document.body.appendChild(info);

  //Defino cámara
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 20);
  
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  
  camcontrols1 = new OrbitControls(camera, renderer.domElement);
	
  //Objetos
  //Textura
  //De la superficie
  const tx1 = new THREE.TextureLoader().load("https://cdn.glitch.global/a3697e1c-92d9-4fc0-985c-d4f5c7dcae9e/earthmap1k.jpg?v=1667386902662");
  const tx2 = new THREE.TextureLoader().load("https://cdn.glitch.global/341720a6-447a-46ce-b3c9-8002f2955b61/earthspec1k.jpg?v=1697720960775");
  
  
  Esfera(-2,0,0,1.8,10,10, 0xffff00);
  
  Cubo(2, 0, 0, 3, 3, 3, 0xffffff);
  
 
  //Rejilla de referencia indicando tamaño y divisiones
  grid = new THREE.GridHelper(20, 40);
  //MOstrarla en vertical
  grid.geometry.rotateX(Math.PI / 2);
  grid.position.set(0, 0, 0.05);
  scene.add(grid);
}

function Esfera(px, py, pz, radio, nx, ny, col) {
  let geometry = new THREE.SphereBufferGeometry(radio, nx, ny);
  //Material básico
  let material = new THREE.MeshBasicMaterial({
    color: col
  });
  
  
  let mesh = new THREE.Mesh(geometry, material);
   mesh.position.set(px, py, pz);
  scene.add(mesh);
  objetos.push(mesh);
}

function Cubo(px, py, pz, sx, sy, sz, col) {
  //Objeto cubo
  let geometry = new THREE.BoxGeometry(sx, sy, sz);
  let material = new THREE.MeshBasicMaterial({
    color: col
  });
  
  
  let mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(px, py, pz);
  //Objeto añadido a la escena
  scene.add(mesh);
  objetos.push(mesh);
}


//Bucle de animación
function animationLoop() {
  requestAnimationFrame(animationLoop);

  //Modifica rotación de todos los objetos
  for (let object of objetos) {
    object.rotation.y += 0.003;
  }
  
  renderer.render(scene, camera);
 
}
