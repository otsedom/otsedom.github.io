import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let scene, renderer;
let camera;
let info;
let grid;
let camcontrols;
let uniforms;
let objetos = [];

init();
animationLoop();

function init() {
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 15);

  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);

  document.body.appendChild(renderer.domElement);

  //Objetos
  uniforms = {
    u_time: {
      type: "f",
      value: 0.0,
    },
    u_resolution: {
      type: "v2",
      value: new THREE.Vector2(),
    },
    u_mouse: {
      type: "v2",
      value: new THREE.Vector2(),
    },
  };

  //Con color sólido
  EsferaShader(-3.0, 0, 0, 1, 10, 10, fragmentShader_01());
  //Color dependiente del píxel
  EsferaShader(-1, 0, 0, 1, 10, 10, fragmentShader_02());
  //Color dependiente del puntero
  EsferaShader(1, 0, 0, 1, 10, 10, fragmentShader_03());
  //Color dependiente del puntero y tiempo
  EsferaShader(3.0, 0, 0, 1, 10, 10, fragmentShader_04());

  camcontrols = new OrbitControls(camera, renderer.domElement);

  //Rejilla de referencia indicando tamaño y divisiones
  grid = new THREE.GridHelper(20, 40);
  //Mostrarla en vertical
  grid.geometry.rotateX(Math.PI / 2);
  grid.position.set(0, 0, 0.05);
  scene.add(grid);

  //Dmensiones iniciales
  onWindowResize();
  window.addEventListener("resize", onWindowResize, false);
}

//Redimensionado de la ventana
function onWindowResize(e) {
  renderer.setSize(window.innerWidth, window.innerHeight);
  uniforms.u_resolution.value.x = renderer.domElement.width;
  uniforms.u_resolution.value.y = renderer.domElement.height;
}

//Evento de ratón
document.onmousemove = function (e) {
  //Normaliza las coordenadas del puntero
  uniforms.u_mouse.value.x = e.pageX / window.innerWidth;
  uniforms.u_mouse.value.y = e.pageY / window.innerHeight;
};

function EsferaShader(px, py, pz, radio, nx, ny, fragsh) {
  let geometry = new THREE.SphereBufferGeometry(radio, nx, ny);
  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    //Shaders
    fragmentShader: fragsh,
    vertexShader: vertexShader(),
  });

  let mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(px, py, pz);
  scene.add(mesh);
  objetos.push(mesh);
}

//Bucle de visualización
function animationLoop() {
  requestAnimationFrame(animationLoop);

  //Incrementa tiempo
  uniforms.u_time.value += 0.05;

  //Modifica rotación de todos los objetos presentes
  for (let object of objetos) {
    object.rotation.y += 0.01;
  }

  renderer.render(scene, camera);
}

function vertexShader() {
  return `
				varying vec3 vUv; 
				varying vec4 modelViewPosition; 
				
				void main() {
				  vUv = position; 
				  vec4 modelViewPosition = modelViewMatrix * vec4(vUv, 1.0);
				  gl_Position = projectionMatrix * modelViewPosition; 
				}
			  `;
}

function fragmentShader_01() {
  return `
				  void main() {
					gl_FragColor = vec4(0.831,0.567,1.000,1.000);
				  }
			  `;
}

function fragmentShader_02() {
  return `
				uniform vec2 u_resolution;
				
				void main() {
					vec2 st = gl_FragCoord.xy/u_resolution;
					gl_FragColor = 		vec4(st.x,st.y,0.0,1.0);
          }
			  `;
}

function fragmentShader_03() {
  return `
				uniform vec2 u_resolution;
				uniform vec2 u_mouse;
				
				void main() {
					gl_FragColor = vec4(u_mouse.x,u_mouse.y,0.0,1.000);
				}
			  `;
}

function fragmentShader_04() {
  return `
				uniform vec2 u_resolution;
				uniform vec2 u_mouse;
				uniform float u_time;

				void main() {
					gl_FragColor = vec4(u_mouse.x,u_mouse.y,abs(sin(u_time)),1.000);
				}
			  `;
}
