import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let renderer, camera, scene;
let uniforms = [];
let camcontrols;

init();
requestAnimationFrame(render);

function vertexShader() {
  return `
        varying vec2 vUv; 
        
        void main() {
            vUv = uv; 

            vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * modelViewPosition; 
        }
    `;
}

function fragmentShader01() {
  return `
        uniform sampler2D texture1; 
        uniform vec3 color;
        varying vec2 vUv;

        void main() {
            gl_FragColor = texture2D(texture1, vUv);
        }
    `;
}




//iaparavertemejor
function fragmentShader02() {
  return `
      // coordenada de textura del shader de fragmentos
      varying vec2 vUv;

      // mapa de textura y resolución
      uniform sampler2D texture1;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;   

      void main(){
        vec2 uv = vUv;
        // saltos en el mapa de textura, relacionado con resolución
        vec2 stepSize = 1./u_resolution;

        // Máscara filtro
        float kernel[9];

        //Cambia el filtro según posición del ratón
        if (u_mouse.x < 0.33){
          //filtro gaussiano
          kernel[0] = 1.0; kernel[1] = 2.0; kernel[2] = 1.0;
          kernel[3] = 2.0; kernel[4] = 4.0; kernel[5] = 2.0;
          kernel[6] = 1.0; kernel[7] = 2.0; kernel[8] = 1.0;
        }
        else{
          if (u_mouse.x < 0.66){
            // bordes
            kernel[0] = -1.0; kernel[1] = -1.0; kernel[2] = -1.0;
            kernel[3] = -1.0; kernel[4] = 8.0; kernel[5] = -1.0;
            kernel[6] = -1.0; kernel[7] = -1.0; kernel[8] = -1.0;
          }
          else{
            // emboss
            kernel[0] = -2.0; kernel[1] = -1.0; kernel[2] = 0.0;
            kernel[3] = -1.0; kernel[4] = 1.0; kernel[5] = 1.0;
            kernel[6] = 0.0; kernel[7] = 1.0; kernel[8] = 2.0;
          }
        }

        //Desplazamientos de los píxeles en la ventana 3x3
        vec2 offset[9];
        offset[0] = vec2(-stepSize.x, -stepSize.y); // arriba izquierda
        offset[1] = vec2(0.0, -stepSize.y);         // arriba centro
        offset[2] = vec2(stepSize.x, -stepSize.y);  // arriba derecha
        offset[3] = vec2(-stepSize.x, 0.0);         // izquierda
        offset[4] = vec2(0.0, 0.0);                 // centro
        offset[5] = vec2(stepSize.x, 0.0);          // derecha right
        offset[6] = vec2(-stepSize.x, stepSize.y);  // abajo izquierda
        offset[7] = vec2(0.0, stepSize.y);          // abajo centro
        offset[8] = vec2(stepSize.x, stepSize.y);   // abajo derecha

        // Aplica la máscara a los vecinos en la rejilla 3x3
        float kernelWeight = 0.0;
        vec4 conv = vec4(0.0);
        for(int i = 0; i<9; i++){
          // color de textura por valor máscara
          conv += texture2D(texture1, uv + offset[i]) * kernel[i];
          // suma pesos de la máscara para normalizar
          kernelWeight += kernel[i];
        }

        // normaliza el valor si necesario
        if (kernelWeight > 1.)
          gl_FragColor = vec4(abs(conv.rgb)/kernelWeight, 1.0);
        else
          gl_FragColor = vec4(abs(conv.rgb), 1.0);
      }
    `;
}

function init() {
  //Defino cámara
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 20);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  //Plano con shader y textura
  const loader = new THREE.TextureLoader();
  const tx = loader.load(
    //"https://cdn.glitch.global/341720a6-447a-46ce-b3c9-8002f2955b61/earthspec1k.jpg?v=1697720960775"
    "https://cdn.glitch.global/341720a6-447a-46ce-b3c9-8002f2955b61/earthmap1k.jpg?v=1697720958542"
  );

  uniforms = {
    texture1: { value: tx },
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
    color: {
    	value: new THREE.Color()
    }
  };

  PlanoShader(-3, 0, 0, 4, 4, fragmentShader01(), vertexShader());
  PlanoShader(3, 0, 0, 4, 4, fragmentShader02(), vertexShader());

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

//Movimiento del ratón
window.addEventListener('mousemove', (event) => {
  // Calcula la posición del ratón normalizada
  const mouseX = event.clientX / window.innerWidth;
  const mouseY = 1.0 - event.clientY / window.innerHeight; // Invertimos Y para que 0,0 esté en la esquina inferior izquierda
  
  // Actualiza el uniforme u_mouse
  uniforms.u_mouse.value.set(mouseX, mouseY);
});

function PlanoShader(px, py, pz, sx, sy, fsh, vsh) {
  let geometry = new THREE.PlaneBufferGeometry(sx, sy);

  //Color aleatorio  
  uniforms.color.value.set(Math.random() * 0xffffff);
  
  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,    
    fragmentShader: fsh,
    vertexShader: vsh,
  });

  let mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(px, py, pz);
  
  scene.add(mesh);
}



function render() {
  //Incrementa tiempo
  uniforms.u_time.value += 0.05;

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
