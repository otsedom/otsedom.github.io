import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

let scene, renderer;
let camera;
let camcontrols;
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
  camera.position.set(0, 0, 15);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  
  const loader = new THREE.TextureLoader();
  //Textura diurna
  const txd = loader.load(
    "https://cdn.glitch.global/341720a6-447a-46ce-b3c9-8002f2955b61/earth_surface.jpg?v=1730447927767"
  );
  //Textura nocturna
  const txn = loader.load(
    "https://cdn.glitch.global/341720a6-447a-46ce-b3c9-8002f2955b61/2k_earth_nightmap.jpg?v=1730447924263"
  );

  uniforms = {
    texture1: { value: txd },
    texture2: { value: txn },    
    u_resolution: {
      type: "v2",
      value: new THREE.Vector2(),
    },
  };

  //Objetos
  Esfera(0, 0, 0, 1.0, 10, 10, 0xffff00);
  EsferaShader(4, 0, 0, 0.5, 10, 10);

  //Orbit controls
  camcontrols = new OrbitControls(camera, renderer.domElement);
  
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

function EsferaShader(px, py, pz, radio, nx, ny) {
  let geometry = new THREE.SphereGeometry(radio, nx, ny);
  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    fragmentShader: fragmentShader(),
    vertexShader: vertexShader(),
  });

  let mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(px, py, pz);
  scene.add(mesh);
  objetos.push(mesh);
}

//De Agustín Vizcaíno
function fragmentShader() {
  return `
        uniform sampler2D texture1;
        uniform sampler2D texture2;
        varying vec2 vUv;
        varying vec3 v_vert2Sun;
        varying vec3 v_Normal;

        void main() {
            float LdotN = dot(v_vert2Sun, v_Normal);
            //Utiliza distinta textura en función de si mira hacia la luz (LdotN>0) o no hacia la luz
            if (LdotN > 0.0) {
              gl_FragColor = vec4( texture2D(texture1, vUv).rgb * LdotN, 1.0);//Pondera color por LdotN, Lambert
            } else {
              gl_FragColor = vec4( texture2D(texture2, vUv).rgb, 1.0);
            }
          }
			  `;
}

function vertexShader() {
  return `
        varying vec2 vUv;
        varying vec3 v_Normal;
        varying vec3 v_vert2Sun;
        
				void main() {
				  vUv = uv;
				  vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
          //Posición del sol
          vec4 viewSunPos = viewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
          //Normal
          v_Normal = normalize( normalMatrix * normal );
          //Vector hacia el sol, la fuente de luz
          v_vert2Sun = normalize(viewSunPos.xyz - modelViewPosition.xyz);
				  gl_Position = projectionMatrix * modelViewPosition; 
				}
			  `;
}

//Bucle de animación
function animationLoop() {
  requestAnimationFrame(animationLoop);

  //Autorrotación del planeta
  objetos[1].rotation.y += 0.01;
  
  renderer.render(scene, camera);
}
