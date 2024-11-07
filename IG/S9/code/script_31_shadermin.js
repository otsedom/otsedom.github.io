import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

let scene, renderer;
let camera;
let info;
let grid;
let camcontrols1, camcontrols2;
let objetos = [];
let uniforms = {};

init();
animationLoop();

function init() {
  //Defino cámara
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 5);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  //Objetos
  Esfera(-1.5, 0, 0, 0.8, 10, 10, 0xffff00);
  EsferaShader(1.5, 0, 0, 0.8, 10, 10);

  //Orbit control y rejilla
  camcontrols1 = new OrbitControls(camera, renderer.domElement);
  grid = new THREE.GridHelper(20, 40);
  grid.geometry.rotateX(Math.PI / 2);
  grid.position.set(0, 0, 0.05);
  scene.add(grid);
}

function Esfera(px, py, pz, radio, nx, ny, col) {
  let geometry = new THREE.SphereBufferGeometry(radio, nx, ny);
  let material = new THREE.MeshBasicMaterial({
    color: col,
  });

  let mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(px, py, pz);
  scene.add(mesh);
  objetos.push(mesh);
}

function vertexShader() {
  return `
				varying vec3 vUv; 
				varying vec4 modelViewPosition; 
				
				void main() {
				  vUv = position; 
				  vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
				  gl_Position = projectionMatrix * modelViewPosition; 
				}
			  `;
}

function fragmentShader() {
  return `
				  void main() {
					  gl_FragColor = vec4(0.031,0.567,1.000,0.500);
				  }
			  `;
}

function EsferaShader(px, py, pz, radio, nx, ny) {
  let geometry = new THREE.SphereGeometry(radio, nx, ny);
  let material = new THREE.ShaderMaterial({
    fragmentShader: fragmentShader(),
    vertexShader: vertexShader(),
  });

  let mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(px, py, pz);
  scene.add(mesh);
  objetos.push(mesh);
}

//Bucle de animación
function animationLoop() {
  requestAnimationFrame(animationLoop);

  //Modifica rotación de todos los objetos
  for (let object of objetos) {
    object.rotation.y += 0.01;
  }

  renderer.render(scene, camera);
}
