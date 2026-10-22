import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let scene, renderer;
let camera, camera2;
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

  /*camera2 = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera2.position.set(0, 0, 10);*/

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  camcontrols1 = new OrbitControls(camera, renderer.domElement);

  const Lamb = new THREE.AmbientLight(0xffffff, 0.75);
  scene.add(Lamb);

  const Ldir = new THREE.DirectionalLight(0xcccccc, 1);
  Ldir.position.set(5, 5, 5);
  scene.add(Ldir);
  Ldir.castShadow = true;

  //Objetos
  //mapas de texturas
  //De la superficie
  //Fuente texturas https://gis.humboldt.edu/Archive/GISData/2019/WGS84_Geographic/3DTextures

  const tx1 = new THREE.TextureLoader().load("src/earthmap1k.jpg");
  const txb1 = new THREE.TextureLoader().load("src/earthbump1k.jpg");
  const txspec1 = new THREE.TextureLoader().load("src/earthspec1k.jpg");
  //Capa de nubes
  const tx2 = new THREE.TextureLoader().load("src/earthcloudmap.jpg");
  //const txalpha2 = new THREE.TextureLoader().load("src/earthcloudmaptrans.jpg");
  const txalpha2 = new THREE.TextureLoader().load(
    "src/earthcloudmaptrans_invert.jpg"
  );

  //Planeta
  Esfera(scene, 0.0, -3.0, 0, 2, 40, 40, 0xffffff);
  //Esfera(scene, -6.0, 3.0, 0, 2, 40, 40, 0xffffff, tx1);
  //Esfera(scene, 0.0, 3.0, 0, 2, 40, 40, 0xffffff, tx1, txb1);
  //Esfera(scene, 6.0, 3.0, 0, 2, 40, 40, 0xffffff, tx1, txb1, txspec1);
  //Capa de nubes
  //Planeta y capa de nubes sin transparencia
  //Esfera(scene, -6.0, -3.0, 0, 2, 40, 40, 0xffffff, tx1, txb1, txspec1);
  //Ancestro el planeta apenas creado, movimiento solidario
  //Esfera(objetos[4], 0.0, 0.0, 0, 2.1, 40, 40, 0xffffff, tx2);

  //Planeta y capa de nubes con transparencia
  //Esfera(scene, 6.0, -3.0, 0, 2, 40, 40, 0xffffff, tx1, txb1, txspec1);
  //Ancestro el planeta apenas creado, movimiento solidario
  //Esfera(objetos[6], 0.0, 0.0, 0, 2.1, 40, 40, 0xffffff, tx2, undefined, undefined, txalpha2 );

  //Rejilla de referencia indicando tamaño y divisiones
  grid = new THREE.GridHelper(20, 40);
  //Mostrarla en vertical
  grid.geometry.rotateX(Math.PI / 2);
  grid.position.set(0, 0, 0.05);
  scene.add(grid);
}

function Esfera(
  padre,
  px,
  py,
  pz,
  radio,
  nx,
  ny,
  col,
  texture = undefined,
  texbump = undefined,
  texspec = undefined,
  texalpha = undefined,
  sombra = false
) {
  let geometry = new THREE.SphereBufferGeometry(radio, nx, ny);
  //Material Phong definiendo color
  let material = new THREE.MeshPhongMaterial({
    color: col,
  });

  //Textura
  if (texture != undefined) {
    material.map = texture;
  }
  //Rugosidad
  if (texbump != undefined) {
    material.bumpMap = texbump;
    material.bumpScale = 1;
  }

  //Especular
  if (texspec != undefined) {
    material.specularMap = texspec;
    material.specular = new THREE.Color("orange");
  }

  //Transparencia
  if (texalpha != undefined) {
    //Con mapa de transparencia
    material.alphaMap = texalpha;
    material.transparent = true;
    material.side = THREE.DoubleSide;
    material.opacity = 1.0;

    //Sin mapa de transparencia
    /*material.transparent = true;
    material.side = THREE.DoubleSide;
    material.opacity = 0.8;
    material.transparent = true;
    material.depthWrite = false;*/
  }

  let mesh = new THREE.Mesh(geometry, material);
  if (sombra) mesh.castShadow = true;
  mesh.position.set(px, py, pz);
  padre.add(mesh);
  objetos.push(mesh);
}

//Bucle de animación
function animationLoop() {
  requestAnimationFrame(animationLoop);

  //Modifica rotación de todos los objetos
  for (let object of objetos) {
    object.rotation.y += 0.003;
  }

  let x, y, w, h;

  //Efecto similar al puerto de vista de defecto, ocupa toda la ventana
  /*x = Math.floor(window.innerWidth * 0.0);
  y = Math.floor(window.innerHeight * 0.0);
  w = Math.floor(window.innerWidth * 0.5);
  h = Math.floor(window.innerHeight * 0.5);

  renderer.setViewport(x, y, w, h);
  renderer.setScissor(x, y, w, h);
  renderer.setScissorTest(true);

  renderer.render(scene, camera);

  //Efecto similar al de defecto, ocupa toda la ventana
  x = Math.floor(window.innerWidth * 0.5);
  y = Math.floor(window.innerHeight * 0.0);
  w = Math.floor(window.innerWidth * 0.5);
  h = Math.floor(window.innerHeight * 1.0);

  renderer.setViewport(x, y, w, h);
  renderer.setScissor(x, y, w, h);*/
  //renderer.setScissorTest( true );

  renderer.render(scene, camera);
}
