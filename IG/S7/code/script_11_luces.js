import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'


let scene, renderer;
let camera;
let info;
let grid;
let camcontrols;
let objetos = [];

// GUI
const gui = new GUI();

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
  info.innerHTML = "three.js - luces";
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

  camcontrols = new OrbitControls(camera, renderer.domElement);

  //Rejilla de referencia
  grid = new THREE.GridHelper(20, 40);
  //Mostrarla en vertical
  grid.geometry.rotateX(Math.PI / 2);
  grid.position.set(0, 0, 0.05);
  scene.add(grid);

  //Objetos BasicMaterial
  Esfera(-3.0, 0, 0, 0.8, 10, 10, 0xff0000);
  Esfera(0.0, 0, 0, 0.8, 10, 10, 0x00ff00);
  Esfera(3.0, 0, 0, 0.8, 10, 10, 0x0000ff);

  //Objetos Phong
  /*EsferaPhong(-3.0, 0, 0, 0.8, 10, 10, 0xff0000);
  EsferaPhong(0.0, 0, 0, 0.8, 10, 10, 0x00ff00);
  EsferaPhong(3.0, 0, 0, 0.8, 10, 10, 0x0000ff);*/
  
  //Objeto suelo
  const SueloGeometry = new THREE.BoxGeometry(10, 0.5, 8);
  const SueloMaterial = new THREE.MeshStandardMaterial({ color: 0xfafafa });
  const Suelo = new THREE.Mesh(SueloGeometry, SueloMaterial);
  Suelo.position.y = -5;
  scene.add(Suelo);

  
  //LUCES
  //Luz ambiente, indicando parámetros de color e intensidad
  /*const Lamb = new THREE.AmbientLight(0xffffff, 0.5);
	scene.add(Lamb);
  // Crear panel GUI para la luz ambiente
  const Lamb_Info = gui.addFolder('luz ambiente');

  // Recupera color de la luz par ala GUI
  const Lamb_Params = { color: Lamb.color.getHex() };

  // Control para ajustar intensidad, parámetros con valores extremos e incremento
  Lamb_Info.add(Lamb, 'intensity', 0, 1, 0.1).name('Intensidad');
  // Control para ajustar el color
  Lamb_Info
    .addColor(Lamb_Params, 'color')
    .name('Color')
    .onChange((value) => Lamb.color.set(value));

  // Abrir panel GUI de luz ambiente
  Lamb_Info.open();*/

  //Luz direccional, indicando parámetros de color e intensidad y asistente
  /*const Ldir = new THREE.DirectionalLight(0xffffff, 0.5);
  Ldir.position.set(0, 2, 0);

  // Asistente para visualizar la luz direccional Ldir, indicando su tamaño
  const LdirHelper = new THREE.DirectionalLightHelper(Ldir, 3);
  scene.add(Ldir);
  scene.add(LdirHelper);

  // Crear panel GUI  para la luz direccional
  const Ldir_Info = gui.addFolder('luz direccional');

  // Parámetros de la luz direccional
  const Ldir_Params = {
    visible: true,
    color: Ldir.color.getHex(),
  };

  // Control para ajustar la visibilidad de la luz y su asistente
  Ldir_Info.add(Ldir_Params, 'visible')
    .name('Visible')
    .onChange((value) => {
      Ldir.visible = value;
      LdirHelper.visible = value;
    });

  // Control para ajustar la intensidad, parámetros con valores extremos e incremento
  Ldir_Info.add(Ldir, 'intensity', 0, 1, 0.25).name('Intensidad');

  // Control para ajustar la posición en el eje Y, parámetros con valores extremos e incremento
  Ldir_Info.add(Ldir.position, 'y', 1, 4, 0.5).name('Posición Y');

  // Control para ajustar el color de la luz direccional
  Ldir_Info
    .addColor(Ldir_Params, 'color')
    .name('Color')
    .onChange((value) => Ldir.color.set(value));

  // Abrir panel GUI de luz direccional
  Ldir_Info.open();*/


  //Luz focal indicando color, intensidad, distancia máxima (0 sin límite), ángulo
  /*const Lspot = new THREE.SpotLight(0x00ff00, 1, 0, Math.PI / 8);
  Lspot.position.set(0, 2, 2);

  // Asistente para visualizar la luz focal
  const LspotHelper = new THREE.SpotLightHelper(Lspot);
  scene.add(Lspot, LspotHelper);

  // Crear carpeta para la luz focal
  const Lspot_Info = gui.addFolder('luz spot');

  // Parámetros de la luz focal
  const Lspot_Params = {
    visible: true,
  };

  // Control para ajustar la visibilidad de la luz y su helper
  Lspot_Info.add(Lspot_Params, 'visible')
    .name('Visible')
    .onChange((value) => {
      Lspot.visible = value;
      LspotHelper.visible = value;
    });

  // Control para ajustar la intensidad de la luz spot
  Lspot_Info.add(Lspot, 'intensity', 0, 4, 0.5).name('Intensidad');

  // Control para ajustar el ángulo de apertura de la luz spot
  Lspot_Info.add(Lspot, 'angle', Math.PI / 16, Math.PI / 2, Math.PI / 16)
    .name('Ángulo')
    .onChange(() => LspotHelper.update()); // Asegura que el helper se actualice

  // Abrir panel GUI de luz fopcal
  Lspot_Info.open();*/


  //Luz puntual indicando color, intensidad, distancia máxima (0 no límite)
  /*const Lpunt = new THREE.PointLight(0xffffff, 1, 0, 2);
  Lpunt.position.set(2, 2, 2);

  // Asistente para visualizar la luz puntual
  const LpuntHelper = new THREE.PointLightHelper(Lpunt, 0.5);
  scene.add(Lpunt, LpuntHelper);

  // Crear carpeta para la luz puntual
  const Lpunt_Info = gui.addFolder('luz puntual');

  // Parámetros de la luz puntual
  const Lpunt_Params = {
    visible: true,
    color: Lpunt.color.getHex(),
  };

  // Control para ajustar la visibilidad de la luz y su helper
  Lpunt_Info.add(Lpunt_Params, 'visible')
    .name('Visible')
    .onChange((value) => {
      Lpunt.visible = value;
      LpuntHelper.visible = value;
    });

  // Control para ajustar la intensidad de la luz puntual
  Lpunt_Info.add(Lpunt, 'intensity', 0, 2, 0.25).name('Intensidad');

  // Controles para ajustar la posición de la luz puntual
  Lpunt_Info.add(Lpunt.position, 'x', -2, 4, 0.5).name('Posición X');
  Lpunt_Info.add(Lpunt.position, 'y', -2, 4, 0.5).name('Posición Y');
  Lpunt_Info.add(Lpunt.position, 'z', -2, 4, 0.5).name('Posición Z');

  // Control para ajustar el color de la luz puntual
  Lpunt_Info.addColor(Lpunt_Params, 'color')
    .name('Color')
    .onChange((value) => Lpunt.color.set(value));

  // Abrir la carpeta por defecto
  Lpunt_Info.open();*/

}

function Esfera(px, py, pz, radio, nx, ny, col,sombra =false) {
  let geometry = new THREE.SphereBufferGeometry(radio, nx, ny);
  //Material con o sin relleno
  let material = new THREE.MeshBasicMaterial({
    color: col,
  });
  
  let mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(px, py, pz);
  scene.add(mesh);
  objetos.push(mesh);
}

function EsferaPhong(px, py, pz, radio, nx, ny, col) {
  let geometry = new THREE.SphereBufferGeometry(radio, nx, ny);
  //Material con o sin relleno
  let material = new THREE.MeshPhongMaterial({
    color: col,
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
