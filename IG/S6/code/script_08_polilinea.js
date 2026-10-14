import * as THREE from "three";

// Fuentes
//https://threejs.org/docs/#manual/en/introduction/Creating-a-scene -->
//https://r105.threejsfundamentals.org/threejs/lessons/threejs-primitives.html  -->
let scene;
let camera;
let renderer;
let objetos = [];

let grid, perfil, plano;
const MAX_POINTS = 500;
let raycaster;
let npuntos;

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
  camera.position.set(0, 0, 5);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  //Asistente GridHelper
  grid = new THREE.GridHelper(10, 10);
  grid.position.set(0, 0, 0);
  grid.geometry.rotateX(Math.PI / 2);
  //Desplaza levemente hacia la cámara
  grid.position.set(0, 0, 0.05);

  scene.add(grid);

  //Creo un plano en z=0 que no muestro para la intersección
  let geometryp = new THREE.PlaneGeometry(20, 20);
  let materialp = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
  });
  plano = new THREE.Mesh(geometryp, materialp);
  plano.visible = false;
  scene.add(plano);

  //Rayo para intersección
  raycaster = new THREE.Raycaster();

  //Polilínea dinámica prealojada ver https://threejs.org/docs/#manual/en/introduction/How-to-update-things
  let geometry = new THREE.BufferGeometry();
  // Tres valores por vértice
  let positions = new Float32Array(MAX_POINTS * 3);
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  //Rango a dibujar
  npuntos = 0;
  geometry.setDrawRange(0, npuntos);
  let material = new THREE.LineBasicMaterial({ color: 0xff0000 });
  perfil = new THREE.Line(geometry, material);
  //Añade al grafo de escena
  scene.add(perfil);

  //Manejador de eventos
  document.addEventListener("mousedown", onDocumentMouseDown);
}
function onDocumentMouseDown(event) {
  //Conversión coordenadas del puntero
  const mouse = {
    x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
    y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1,
  };

  //Intersección, define rayo
  raycaster.setFromCamera(mouse, camera);

  // Intersecta
  const intersects = raycaster.intersectObject(plano);
  // ¿Hay alguna intersección?
  if (intersects.length > 0) {
    //Añade vértice a la pòlilínea
    const vertices = perfil.geometry.attributes.position.array;

    vertices[npuntos * 3] = intersects[0].point.x;
    vertices[npuntos * 3 + 1] = intersects[0].point.y;
    vertices[npuntos * 3 + 2] = intersects[0].point.z;
    npuntos++;
    //Muestra el valor de la intersección
    console.log(intersects[0].point);

    Esfera(
      intersects[0].point.x,
      intersects[0].point.y,
      intersects[0].point.z,
      0.2,
      10,
      10,
      0xff00ff
    );
  }
}

function Esfera(px, py, pz, radio, nx, ny, col) {
  let geometry = new THREE.SphereBufferGeometry(radio, nx, ny);
  //Material con o sin relleno
  let material = new THREE.MeshBasicMaterial({
    color: col,
    //wireframe: true, //Descomenta para activar modelo de alambres
  });

  let mesh = new THREE.Mesh(geometry, material);
  //Posición de la esfera
  mesh.position.set(px, py, pz);
  scene.add(mesh);
  objetos.push(mesh);
}

//Bucle de animación
function animate() {
  requestAnimationFrame(animate);

  //Polilínea, define el número de vértices y actualiza posiciones
  perfil.geometry.setDrawRange(0, npuntos);
  perfil.geometry.attributes.position.needsUpdate = true;

  renderer.render(scene, camera);
}
