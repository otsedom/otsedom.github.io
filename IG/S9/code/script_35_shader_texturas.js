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
        varying vec2 vUv;

        void main() {
            gl_FragColor = texture2D(texture1, vUv);
        }
    `;
}

function fragmentShader02() {
  return `
        uniform sampler2D texture1; 
        uniform float u_time;
        varying vec2 vUv;
        
        float scale = 5.0;

        void main() {
            vec2 st = fract(vUv.st*scale);
            gl_FragColor = texture2D(texture1, st);
        }  
    `;
}

function fragmentShader03() {
  return `
        uniform sampler2D texture1; 
        uniform vec2 u_resolution;
        uniform float u_time;
        varying vec2 vUv;
        
        float scale = 2.0;

        void main() {
            vec2 stc = gl_FragCoord.xy/u_resolution;
            vec2 st = fract(vUv.st*scale);
            
            float off = sin(u_time);
            if (sign(off)>0.)
            {
                if ( floor(mod(stc.y*scale,2.0)) == 1.)
                st.x += off;
            }
            else
            {
                if ( floor(mod(stc.x*scale,2.0)) == 1.)
                st.y += off;
            }
            
            gl_FragColor = texture2D(texture1, st);
        }  
    `;
}

function fragmentShader04() {
  return `
        uniform sampler2D texture2; 
        varying vec2 vUv;

        void main() {
            gl_FragColor = vec4( 1.0 - texture2D(texture2, vUv).rgb, 1.0 );
        }
    `;
}



function fragmentShader05() {
  return `
        uniform sampler2D texture2;
        varying vec2 vUv;
        uniform vec2 u_resolution;
        
        float scale = 1.0;
        float step = 0.025;
        
        void main() {
          vec2 stc = gl_FragCoord.xy/u_resolution;
          
          //Distingue filas pares e impares
          if ( mod(stc.y*scale,2.0*step) <= step){
            if ( mod(stc.x*scale,2.0*step) <= step)
                gl_FragColor = vec4( texture2D(texture2, vUv).rgb, 1.0 );
              else
                gl_FragColor = vec4( 1.0 - texture2D(texture2, vUv).rgb, 1.0 );
          }
          else{
            if ( mod(stc.x*scale,2.0*step) <= step)
                gl_FragColor = vec4( 1.0 - texture2D(texture2, vUv).rgb, 1.0 );
              else
                gl_FragColor = vec4( texture2D(texture2, vUv).rgb, 1.0 );
          
          }     
        }
    `;
}

///Filtro 
function fragmentShader06() {
  return `
        uniform sampler2D texture2;
        varying vec2 vUv;
        
        void main() {
        
          //Dimensiones de la textura
          ivec2 tex_size = textureSize(texture2, 0);
          //Desplazamiento según dimensión tetxura
          vec2 texOffset = vec2(1.0/float( tex_size.x ), 1.0/float( tex_size.y ));
          
          // Vecinos del píxel actual según desplazamiento de la textura
          vec2 tc0 = vUv.st + vec2(-texOffset.s, -texOffset.t);
          vec2 tc1 = vUv.st + vec2(         0.0, -texOffset.t);
          vec2 tc2 = vUv.st + vec2(+texOffset.s, -texOffset.t);
          vec2 tc3 = vUv.st + vec2(-texOffset.s,          0.0);
          vec2 tc4 = vUv.st + vec2(         0.0,          0.0);
          vec2 tc5 = vUv.st + vec2(+texOffset.s,          0.0);
          vec2 tc6 = vUv.st + vec2(-texOffset.s, +texOffset.t);
          vec2 tc7 = vUv.st + vec2(         0.0, +texOffset.t);
          vec2 tc8 = vUv.st + vec2(+texOffset.s, +texOffset.t);
          
          //Color de cada vecino
          vec4 col0 = texture2D(texture2, tc0);
          vec4 col1 = texture2D(texture2, tc1);
          vec4 col2 = texture2D(texture2, tc2);
          vec4 col3 = texture2D(texture2, tc3);
          vec4 col4 = texture2D(texture2, tc4);
          vec4 col5 = texture2D(texture2, tc5);
          vec4 col6 = texture2D(texture2, tc6);
          vec4 col7 = texture2D(texture2, tc7);
          vec4 col8 = texture2D(texture2, tc8);
          
          //Aplicamos filtros
          //Gaussiana
          vec4 sum = (1.0 * col0 + 2.0 * col1 + 1.0 * col2 +  
                      2.0 * col3 + 4.0 * col4 + 2.0 * col5 +
                      1.0 * col6 + 2.0 * col7 + 1.0 * col8) / 16.0;
             
          //Sobel
          vec4 sum2 = abs((1.0 * col0 + 2.0 * col1 + 1.0 * col2) - (1.0 * col6 + 2.0 * col7 + 1.0 * col8)) * 10.0;
          
          gl_FragColor = vec4(sum2.rgb, 1.0);  
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
    "https://cdn.glitch.global/8b114fdc-500a-4e05-b3c5-a4afa5246b07/earthmap1k.jpg?v=1666848392635"
  );
  const tx2 = loader.load(
    "https://cdn.glitch.global/341720a6-447a-46ce-b3c9-8002f2955b61/earthspec1k.jpg?v=1697720960775"
  );

  uniforms = {
    texture1: { value: tx },
    texture2: { value: tx2 },
    u_time: {
      type: "f",
      value: 1.0,
    },
    u_resolution: {
      type: "v2",
      value: new THREE.Vector2(),
    },
  };

  PlanoShader(-5, 3, 0, 4, 4, fragmentShader01(), vertexShader());
  PlanoShader(0, 3, 0, 4, 4, fragmentShader02(), vertexShader());
  PlanoShader(5, 3, 0, 4, 4, fragmentShader03(), vertexShader());
  
  PlanoShader(-5, -3, 0, 4, 4, fragmentShader04(), vertexShader());
  PlanoShader(0, -3, 0, 4, 4, fragmentShader05(), vertexShader());
  PlanoShader(5, -3, 0, 4, 4, fragmentShader06(), vertexShader());

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

function PlanoShader(px, py, pz, sx, sy, fsh, vsh) {
  let geometry = new THREE.PlaneBufferGeometry(sx, sy);

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
