import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

let scene, renderer;
let camera, grid;
let camcontrols;

/*let skeletonBones = [];

var clock = new THREE.Clock( true );
let skeleton, worm;
const n = 20;
const boneTam = 1;
const totalTam = n * boneTam;
//const bones = [];*/

let worm, bones, skeletonHelper, lights = [];

init();
animationLoop();

function init() {
  //C, etc.ámara
  scene = new THREE.Scene();
  //scene.background = new THREE.Color( 0x444444 );
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
  lights[ 0 ] = new THREE.DirectionalLight( 0xffffff, 3 );
  lights[ 1 ] = new THREE.DirectionalLight( 0xffffff, 3 );

  lights[ 0 ].position.set( 0, 200, 0 );
  lights[ 1 ].position.set( 100, 200, 100 );

  scene.add( lights[ 0 ] );
  scene.add( lights[ 1 ] );
}


function creaObjeto() {
  //Configuración del objeto 
  const grosorseg = 2; //altura de cada elemento
  const nsegs = 10; //número de elementos
  const longitud = grosorseg * nsegs; //Longitud total
  const longitud2 = longitud * 0.5; //Se usa un par de veces

  //Definición de los huesos
  bones = [];
  //Crea el primero, inicial
  let prevBone = new THREE.Bone();
  bones.push( prevBone );
  //Huesos a lo largo eje x, cuidar que encaje con geometría
  prevBone.position.x = - longitud2;
  //Tantos huesos como eñlementos
  for (let i = 0; i < nsegs; i ++) {
    const bone = new THREE.Bone();
    bone.position.x = grosorseg;
    bones.push(bone);
    prevBone.add(bone);
    prevBone = bone;
  }
  //Crea esqueleto a partir de los huesos
  const skeleton = new THREE.Skeleton(bones);
  
  
  //Geometría adaptada del ejemplo https://threejs.org/docs/scenes/bones-browser.html
  const geometry = new THREE.CylinderGeometry(1,1,longitud, // height
  10, // divisiones en ángulo
  nsegs * 3, // divisiones a lo alto del cilindro
  true // abierto
  );

  //Del ejemplo https://threejs.org/docs/index.html?q=skeleton#api/en/objects/SkinnedMesh
  //Al cargar modelo, estará definido    
  const position = geometry.attributes.position;
  const vertex = new THREE.Vector3();
    //
  const skinIndices = [];
  const skinWeights = [];
  //Recorre los vértices estableciendo relaciones de vértices e influencia de cada segmento (https://discourse.threejs.org/t/skinweight-skinindices-vertex-oh-my/15776/3)
  for ( let i = 0; i < position.count; i ++ ) {
    vertex.fromBufferAttribute( position, i );

    const y = ( vertex.y + longitud2 ); //objeto centrado en origen

    const skinIndex = Math.floor( y/grosorseg );
    const skinWeight = ( y%grosorseg ) / grosorseg;

    skinIndices.push( skinIndex, skinIndex + 1, 0, 0 );
    skinWeights.push( 1 - skinWeight, skinWeight, 0, 0 );
  }

  geometry.setAttribute( 'skinIndex', new THREE.Uint16BufferAttribute( skinIndices, 4 ) );
  geometry.setAttribute( 'skinWeight', new THREE.Float32BufferAttribute( skinWeights, 4 ) );

  
  
  //Crea la malla  
  const material = new THREE.MeshPhongMaterial( {
    color: 0x156289, emissive: 0x072534, side: THREE.DoubleSide,
    //flatShading: true, //Alternar flatshading y wireframe
    wireframe: true
  } );

  worm = new THREE.SkinnedMesh( geometry,	material );  
  //El primer hueso es descendiente
  worm.add(bones[0]);
  //Acopla mala y esqueleto
  worm.bind(skeleton);
  //Tumbo la geometría para que no aparezca vertical
  worm.geometry.rotateZ(-Math.PI / 2);
  
  //Asistente de esqueleto
  skeletonHelper = new THREE.SkeletonHelper( worm );
  skeletonHelper.material.linewidth = 2;
  scene.add( skeletonHelper );

  scene.add( worm );

}

function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

//Bucle de animación
function animationLoop() {
  requestAnimationFrame(animationLoop);
  const time = Date.now() * 0.001;  
  			
  //Movimiento adaptado de https://boytchev.github.io/etudes/threejs/psychedelic-tapeworm.html				
  //Más alejado de la cabeza (bone 0), más acusado el 
  for( var i = 0; i<worm.skeleton.bones.length; i++ )
  {    
    //Efecto hacia la cola amplificando según el índice
    worm.skeleton.bones[i].rotation.z = degreesToRadians( 5*i*Math.sin(1.9*time-i) );//prueba sin -i
    //Leve torsión sobre x más lenta y suave
    worm.skeleton.bones[i].rotation.x = degreesToRadians( i*Math.cos(0.2*time+i*i) );
  }

  //Efectos extras sobre la perte inicial
  //worm.skeleton.bones[0].rotation.z = degreesToRadians( 20*Math.cos(1.9/2*time) );
  //worm.skeleton.bones[1].rotation.z = -worm.skeleton.bones[0].rotation.z/2;
  //worm.skeleton.bones[2].rotation.z = -worm.skeleton.bones[0].rotation.z/2;

 
  renderer.render(scene, camera);
}
