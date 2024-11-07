import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

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
    20,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 5);

  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);

  document.body.appendChild(renderer.domElement);

  //Objetos
  uniforms = {
    u_time: {
      type: "f",
      value: 1.0,
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
  //Plane(5,2,0x0000ff)
  PlaneShader(5, 2, fragmentShader_03());

  camcontrols = new OrbitControls(camera, renderer.domElement);

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
  uniforms.u_mouse.value.x = e.pageX / window.innerWidth;
  uniforms.u_mouse.value.y = e.pageY / window.innerHeight;
};

function PlaneShader(sx, sy, fragsh) {
  let geometry = new THREE.PlaneBufferGeometry(sx, sy);
  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    //Color sólido
    fragmentShader: fragsh,
    vertexShader: vertexShader(),
  });

  let mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  objetos.push(mesh);
}

function Plane(sx, sy, col) {
  let geometry = new THREE.PlaneBufferGeometry(sx, sy);
  let material = new THREE.ShaderMaterial({
    color: col,
  });

  let mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  objetos.push(mesh);
}

//Bucle de visualización
function animationLoop() {
  requestAnimationFrame(animationLoop);

  //Incrementa tiempo
  uniforms.u_time.value += 0.05;

  renderer.render(scene, camera);
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

function fragmentShader_01() {
  return `
					uniform vec2 u_resolution;
					uniform float u_time;

					void main() {
					//Normalizamos coordenadas del píxel en base a la resolución
					vec2 st = gl_FragCoord.xy/u_resolution;

					//Escala de grises izquierda a derecha
					gl_FragColor = vec4(vec3(st.x),1.0);
					}
			  `;
}

function fragmentShader_02() {
  return `
				uniform vec2 u_resolution;
				uniform float u_time;

				float grosor=0.1;

				void main() {
					vec2 st = gl_FragCoord.xy/u_resolution.xy;

					vec3 color = vec3(st.x);	//Escala de grises izquierda a derecha;
					// Línea    
					if (st.y-grosor<st.x && st.x<st.y+grosor)
						color = vec3(0.0,1.0,0.0);	//Verde

					gl_FragColor = vec4(color,1.0);
				}
			  `;
}

function fragmentShader_03() {
  return `
				uniform vec2 u_resolution;
				uniform float u_time;

				float grosor=0.1;

				float plot(vec2 st, float pct){
				//smoothstep da salida suave entre dos valores (Hermite)
				//Combina dos para crear el chichón
				return  smoothstep( pct-grosor, pct, st.y) -
						smoothstep( pct, pct+grosor, st.y);
				}

				void main() {
				  vec2 st = gl_FragCoord.xy/u_resolution.xy;

				  vec3 color = vec3(st.x);	//Escala de grises izquierda a derecha;

				  //Valor a tomar como referencia para bordes suaves
				  float val = st.x;

				  //Combina escala con línea según el valor de pct
				  float pct = plot(st,val);
          
				  // Valores altos verde, bajos escala de grises
				  color = (1.0-pct)*color+pct*vec3(0.0,1.0,0.0);

				  gl_FragColor = vec4(color,1.0);
				}
			  `;
}
