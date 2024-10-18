import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let scene, renderer;
let camera;
let info;
let grid;
let estrella, Planetas = [];

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
  info.innerHTML = "estrella y planetas";
  document.body.appendChild(info);

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

  let camcontrols = new OrbitControls(camera, renderer.domElement);

  //Rejilla de referencia indicando tamaño y divisiones
  grid = new THREE.GridHelper(20, 40);
  //Mostrarla en vertical
  grid.geometry.rotateX(Math.PI / 2);
  grid.position.set(0, 0, 0.05);
  scene.add(grid);

  //Objetos
  Estrella(1.8, 0xffff00);
  Planeta(-4,0,0,0.8,10,10, 0xff0ff0);
  Planeta(3,0,0,0.4,10,10, 0x00ffff);
  
  //PlanetaChild
  //PlanetaChild(estrella,-4,0,0,0.8,10,10, 0xff0ff0);
  //PlanetaChild(estrella,3,0,0,0.4,10,10, 0x00ffff);
}

function Estrella(rad, col) {
  let geometry = new THREE.SphereGeometry(rad, 10, 10);
  let material = new THREE.MeshBasicMaterial({ color: col });
  estrella = new THREE.Mesh(geometry, material);
  scene.add(estrella);
}


function Planeta(px, py, pz, radio, nx, ny, col) {
  let geometry = new THREE.SphereBufferGeometry(radio, nx, ny)
  //Material con o sin relleno
  let material = new THREE.MeshBasicMaterial({
        color: col,
        wireframe: true, //Descomenta para activar modelo de alambres
      });
 
  let mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(px,py,pz);
  scene.add(mesh)
  Planetas.push(mesh)
}

//Defino la nueva función que recibe al padre como argumento de entrada
function PlanetaChild(padre,px,py,pz, radio, nx, ny, col) {
	let geometry = new THREE.SphereBufferGeometry(radio, nx, ny)
	let material = new THREE.MeshBasicMaterial({
					color: col,
					//wireframe: true, //Descomenta para activar modelo de alambres
				  });

	let mesh = new THREE.Mesh(geometry, material)
	mesh.position.set(px,py,pz);
	padre.add(mesh)// Se define el padre
	Planetas.push(mesh)
}


//Bucle de animación
function animationLoop() {
  requestAnimationFrame(animationLoop);

  //Modifica rotación de todos los objetos en Planetas
  Planetas.forEach(function (planeta) {
    planeta.rotation.y += 0.01;
  });
 
  //estrella.rotation.y += 0.01;
    
  renderer.render(scene, camera);
}