import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let scene, renderer, camera;
let camcontrols1;
let mapsx, mapsy;

init();
animate();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  //Posición de la cámara
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camcontrols1 = new OrbitControls(camera, renderer.domElement);
  const light = new THREE.AmbientLight();
  scene.add(light);

  //Textura mundo
  //Fuente https://gis.humboldt.edu/Archive/GISData/2019/WGS84_Geographic/3DTextures
  const tx1 = new THREE.TextureLoader().load("src/earthmap1k.jpg");
  //Mapa de elevación 1 fuente https://visibleearth.nasa.gov/images/73934/topography
  const dm1 = new THREE.TextureLoader().load(
    "src/gebco_08_rev_elev_5400x2700.png"
  );
  //Mapa de elevación 2 con batimetría Fuente https://sbcode.net/threejs/displacmentmap/
  const dm2 = new THREE.TextureLoader().load(
    "src/gebco_bathy.5400x2700_8bit.jpg"
  );

  //Objeto
  mapsx = 21.6 / 2.5;
  mapsy = 10.8 / 2.5;
  //Elevación terrestre
  Plano(0, 0, 0, mapsx, mapsy, tx1, dm1);
  //Plano(0, 0, 0, mapsx, mapsy, tx1, dm2);
}

function Plano(px, py, pz, sx, sy, txt, dismap) {
  let geometry = new THREE.PlaneBufferGeometry(sx, sy, 200, 200);
  let material = new THREE.MeshPhongMaterial({
    wireframe: true,
  });

  //Textura
  if (txt != undefined) {
    material.map = txt;
  }

  if (dismap != undefined) {
    material.displacementMap = dismap;
    material.displacementScale = 0.2;
  }

  let mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(px, py, pz);
  scene.add(mesh);
}

//Bucle de animación
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
