import * as THREE from "three";
import TWEEN from 'https://cdn.jsdelivr.net/npm/@tweenjs/tween.js@18.5.0/dist/tween.esm.js'


let scene, renderer;
let camera;
let objetos = [];
let recorder, stream, chunks = [];
let recording = false;

init();
animationLoop();

function init() {
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

  //Objetos
  let sz = 1.5;
  let px = -3;
  let py = 3;
  let pz = 3
  let ite;
  let tstep = 1000;
  Cubo(px, py, 0, sz, sz, 1.5*sz, 0x00ff00);
  Cubo(px, py, py, sz, sz, 1.5*sz, 0x00ff00);
  Cubo(-px, -py, 0, sz, sz, 1.5*sz, 0x00ff00);
  Cubo(-px, -py, py, sz, sz, 1.5*sz, 0x00ff00);
  
  // Encadena tweens 
  const tween1 = new TWEEN.Tween({ x: 0, xRotation: 0, col: 0xffff00 })
    .to({ x: 2*Math.abs(px), xRotation: Math.PI / 2, col: 0xffffff }, tstep)
    .onUpdate((coords) => {
      let id = 0;
      for (let object of objetos) {
        if (id==0)
          object.position.x = px + coords.x;
        if (id==1)
          object.position.z = pz - coords.x;
        if (id==2)
          object.position.x = Math.abs(px) - coords.x;
        if (id==3)
          object.position.z = pz - coords.x;
        
        id += 1;
      }
    })
    .onRepeat((info) => {
      //px += 3;
      ite += 1;
    })
    .onStart(() => {
      ite = 0;
    })
    .easing(TWEEN.Easing.Exponential.InOut)
    .delay(100)
    
  const tween2 = new TWEEN.Tween({ y: 0, xRotation: 0, col: 0xffff00 })
    .to({ y: 2*Math.abs(py), xRotation: Math.PI / 2, col: 0xffffff }, tstep)
    .onUpdate((coords) => {
      let id = 0;
      for (let object of objetos) {
        if (id==0)
          object.position.y = py  - coords.y;
        if (id==1)
          object.position.x = px + coords.y;
        if (id==2)
          object.position.y = -py + coords.y;
        if (id==3)
          object.position.x = Math.abs(px) - coords.y;
        
        id += 1;
      }
    })
    .onRepeat((info) => {
      //px += 3;
      ite += 1;
    })
    .onStart(() => {
      ite = 0;
    })
    .easing(TWEEN.Easing.Exponential.InOut)
    .delay(100)
    //.repeat(5);
  
  const tween3 = new TWEEN.Tween({ x: 0, xRotation: 0, col: 0xffff00 })
    .to({ x: 2*Math.abs(px), xRotation: Math.PI / 2, col: 0xffffff }, tstep)
    .onUpdate((coords) => {
      let id = 0;
      for (let object of objetos) {
        if (id==0)
          object.position.x = Math.abs(px) - coords.x;
        if (id==1)
          object.position.z = -pz + coords.x;
        if (id==2)
          object.position.x = px + coords.x;
        if (id==3)
          object.position.z = -pz + coords.x;
        
        id += 1;
      }
    })
    .onRepeat((info) => {
      //px += 3;
      ite += 1;
    })
    .onStart(() => {
      ite = 0;
    })
    .easing(TWEEN.Easing.Exponential.InOut)
    .delay(100)
    //.repeat(5);
  
  const tween4 = new TWEEN.Tween({ y: 0, xRotation: 0, col: 0xffff00 })
    .to({ y: 2*Math.abs(py), xRotation: Math.PI / 2, col: 0xffffff }, tstep)
    .onUpdate((coords) => {
      let id = 0;
      for (let object of objetos) {
        if (id==0)
          object.position.y = -py + coords.y;
        if (id==1)
          object.position.x = -px - coords.y;
        if (id==2)
          object.position.y = py  - coords.y;
        if (id==3)
          object.position.x = px + coords.y;
        
        id += 1;
      }
    })
    .onRepeat((info) => {
      //px += 3;
      ite += 1;
    })
    .onStart(() => {
      ite = 0;
    })
    .easing(TWEEN.Easing.Exponential.InOut)
    .delay(100)
  
  tween1.chain(tween2);
  tween2.chain(tween3);
  tween3.chain(tween4);
  tween4.chain(tween1);
  
  tween1.start();
  
  
  // Manejo de eventos para iniciar/detener la grabación
  document.addEventListener('keydown', (event) => {
      if (event.key === 'r') {
          if (recording) {
              stopRecording();
          } else {
              startRecording();
          }
      }
  });
}

function Cubo(px, py, pz, sx, sy, sz, col) {
  let geometry = new THREE.BoxBufferGeometry(sx, sy, sz);
  //Material con o sin relleno
  let material = new THREE.MeshNormalMaterial({ //Cada cara un tono
    color: col,
    //wireframe: true, //Descomenta para activar modelo de alambres
  });

  let mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(px, py, pz);
  scene.add(mesh);
  objetos.push(mesh);
}

// Iniciar la grabación
function startRecording() {
    if (!recording) {
        // Crear el stream desde el canvas
        stream = renderer.domElement.captureStream(30); // 30 fps
        recorder = new MediaRecorder(stream);

        recorder.ondataavailable = function (e) {
            chunks.push(e.data);
        };

        recorder.onstop = function () {
            const blob = new Blob(chunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'threejs_video.webm';
            link.click();
        };

        recorder.start();
        recording = true;
        console.log('Grabación iniciada...');
    }
}

// Detener la grabación
function stopRecording() {
    if (recording) {
        recorder.stop();
        recording = false;
        console.log('Grabación detenida...');
    }
}

//Bucle de animación
function animationLoop() {
  requestAnimationFrame(animationLoop);

  TWEEN.update();

  renderer.render(scene, camera);
}
