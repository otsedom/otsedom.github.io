import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

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
  //Fuente texturas https://gis.humboldt.edu/Archive/GISData/2019/WGS84_Geographic/3DTextures
  const tx1 = new THREE.TextureLoader().load("src/earthmap1k.jpg");
  //const tx1 = new THREE.TextureLoader().load("src/earthcloudmap.jpg");
  const tx2 = new THREE.TextureLoader().load("src/earthspec1k.jpg");

  Esfera(-2, 0, 0, 1.8, 10, 10, 0xffffff, tx1);

  //Cubo(2, 0, 0, 3, 3, 3, 0xffffff, tx2, tx2);

  //Rejilla de referencia indicando tamaño y divisiones
  grid = new THREE.GridHelper(20, 40);
  //MOstrarla en vertical
  grid.geometry.rotateX(Math.PI / 2);
  grid.position.set(0, 0, 0.05);
  scene.add(grid);
}

function Esfera(px, py, pz, radio, nx, ny, col, texture = undefined) {
  let geometry = new THREE.SphereBufferGeometry(radio, nx, ny);
  //Material básico
  let material = new THREE.MeshBasicMaterial({
    color: col,
  });

  if (texture != undefined) {
    material.map = texture;
  }

  let mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(px, py, pz);
  scene.add(mesh);
  objetos.push(mesh);
}

function Cubo(
  px,
  py,
  pz,
  sx,
  sy,
  sz,
  col,
  texture1 = undefined,
  alpha = undefined
) {
  let geometry = new THREE.BoxBufferGeometry(sx, sy, sz);

  let material1 = new THREE.MeshBasicMaterial({
    color: col,
  });

  //Textura
  if (texture1 != undefined) {
    material1.map = texture1;
  }

  //Textura transparencia
  if (alpha != undefined) {
    material1.alphaMap = alpha;
    material1.transparent = true;
    material1.side = THREE.DoubleSide;
    //material.opacity = 1.0;
  }

  //Texturas diferente por cara
  //let materials = [material1, material2, material1, material2, material1, material2]

  let mesh = new THREE.Mesh(geometry, material1);
  mesh.position.set(px, py, pz);
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
