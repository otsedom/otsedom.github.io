import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let scene, renderer;
let camera;
let camcontrols;

let criatura; //Esfera + tentáculos
let tentaculos = []; //Lista de tentáculos
let lights = [];

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
  camera.position.set(0, 0, 25);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camcontrols = new OrbitControls(camera, renderer.domElement);

  creaObjeto();

  //Un par de luces
  lights[0] = new THREE.DirectionalLight(0xffffff, 3);
  lights[1] = new THREE.DirectionalLight(0xffffff, 3);

  lights[0].position.set(0, 200, 0);
  lights[1].position.set(100, 200, 100);

  scene.add(lights[0]);
  scene.add(lights[1]);
}

//Crea la esfera y distribuye los tentáculos por su superficie
function creaObjeto() {
  const radio = 4; //radio esfera
  const ntent = 12; //número tentáculos

  criatura = new THREE.Group();

  //Esfera central
  const esfera = new THREE.Mesh(
    new THREE.SphereGeometry(radio, 32, 16),
    new THREE.MeshPhongMaterial({ color: 0x156289, emissive: 0x072534 })
  );
  criatura.add(esfera);

  //Tentáculos repartidos uniformemente (espiral de Fibonacci sobre la esfera)
  const ejeX = new THREE.Vector3(1, 0, 0); //el tentáculo se construye a lo largo de x
  const dir = new THREE.Vector3();
  const aureo = Math.PI * (3 - Math.sqrt(5));

  for (let k = 0; k < ntent; k++) {
    const y = 1 - (2 * (k + 0.5)) / ntent;
    const r = Math.sqrt(1 - y * y);
    //Distribuye direcciones
    dir.set(Math.cos(k * aureo) * r, y, Math.sin(k * aureo) * r);

    const tentaculo = creaTentaculo();
    tentaculo.userData.fase = k * 0.7; //desfase para que no se muevan igual

    //Pivote en el centro de la esfera, orientado hacia la dirección del tentáculo
    const pivote = new THREE.Group();
    pivote.quaternion.setFromUnitVectors(ejeX, dir);

    //Desplaza el tentáculo para que su base arranque en la superficie
    //Está centrado en el origen, la base está en x = -longitud/2)
    tentaculo.position.x = radio - 0.3 + tentaculo.userData.longitud / 2;

    pivote.add(tentaculo);
    criatura.add(pivote);
    tentaculos.push(tentaculo);
  }

  scene.add(criatura);
}

//Devuelve un tentáculo (SkinnedMesh) con su esqueleto
function creaTentaculo() {
  //Configuración  objeto
  const grosorseg = 1; //altura de cada elemento
  const nsegs = 8; //número de elementos
  const longitud = grosorseg * nsegs; //Longitud total
  const longitud2 = longitud * 0.5;

  //Definición de los huesos
  const bones = [];
  //Crea el primero, inicial
  let prevBone = new THREE.Bone();
  bones.push(prevBone);
  //Huesos a lo largo eje x, cuidar que encaje con geometría
  prevBone.position.x = -longitud2;
  //Tantos huesos como elementos
  for (let i = 0; i < nsegs; i++) {
    const bone = new THREE.Bone();
    bone.position.x = grosorseg;
    bones.push(bone);
    prevBone.add(bone);
    prevBone = bone;
  }
  //Crea esqueleto a partir de los huesos
  const skeleton = new THREE.Skeleton(bones);

  //Cilindro cónico: más fino en la punta que en la base
  const geometry = new THREE.CylinderGeometry(
    0.15, // radio punta
    0.5, // radio base
    longitud,
    10, // divisiones en ángulo
    nsegs * 3, // divisiones a lo largo del cilindro
    true // abierto en extremos
  );

  //Del ejemplo https://threejs.org/docs/index.html?q=skeleton#api/en/objects/SkinnedMesh
  //Al cargar modelo, estará definido
  const position = geometry.attributes.position;
  const vertex = new THREE.Vector3();
  const skinIndices = [];
  const skinWeights = [];
  //Recorre los vértices estableciendo relaciones de vértices e influencia de cada segmento
  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i);

    const y = vertex.y + longitud2; //objeto centrado en origen

    const skinIndex = Math.min(Math.floor(y / grosorseg), nsegs); //evita pasarse del último hueso
    const skinWeight = (y % grosorseg) / grosorseg;

    skinIndices.push(skinIndex, Math.min(skinIndex + 1, nsegs), 0, 0);
    skinWeights.push(1 - skinWeight, skinWeight, 0, 0);
  }

  geometry.setAttribute(
    "skinIndex",
    new THREE.Uint16BufferAttribute(skinIndices, 4)
  );
  geometry.setAttribute(
    "skinWeight",
    new THREE.Float32BufferAttribute(skinWeights, 4)
  );

  //Crea la malla
  const material = new THREE.MeshPhongMaterial({
    color: 0x2a9d8f,
    emissive: 0x072534,
    side: THREE.DoubleSide,
    wireframe: true, //Descomentar para ver la malla y esqueleto
  });

  const tentaculo = new THREE.SkinnedMesh(geometry, material);
  //El primer hueso es descendiente
  tentaculo.add(bones[0]);
  //Acopla malla y esqueleto
  tentaculo.bind(skeleton);
  //Tumbo la geometría para que quede a lo largo de x
  tentaculo.geometry.rotateZ(-Math.PI / 2);

  tentaculo.userData.longitud = longitud;
  return tentaculo;
}

function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

//Bucle de animación
function animationLoop() {
  requestAnimationFrame(animationLoop);
  const time = Date.now() * 0.001;

  for (const tentaculo of tentaculos) {
    const fase = tentaculo.userData.fase;
    const bones = tentaculo.skeleton.bones;

    //Más alejado de la base (bone 0), más acusado
    for (let i = 0; i < bones.length; i++) {
      bones[i].rotation.z = degreesToRadians(
        5 * i * Math.sin(1.9 * time - i + fase)
      );
      //Leve torsión sobre x más lenta y suave
      bones[i].rotation.x = degreesToRadians(
        i * Math.cos(0.2 * time + i * i + fase)
      );
    }
  }

  //Giro lento de toda la criatura
  criatura.rotation.y = time * 0.2;

  renderer.render(scene, camera);
}
