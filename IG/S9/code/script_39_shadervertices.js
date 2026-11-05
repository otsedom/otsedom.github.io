import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
let scene, renderer, camera;
let grid;
let camcontrols1;
let uniforms, uniformsM;

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
  camera.position.set(0, 0, 8);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  uniforms = {
    u_time: {
      type: "f",
      value: 0.0,
    },
  };

  //De vértices
  PlanoShader(
    -2,
    2,
    0,
    1.5,
    1.5,
    50,
    50,
    fragmentShader1(),
    vertexShader1(),
    uniforms
  );
  PlanoShader(
    0,
    2,
    0,
    1.5,
    1.5,
    50,
    50,
    fragmentShader1(),
    vertexShader2(),
    uniforms
  );
  PlanoShader(
    2,
    2,
    0,
    1.5,
    1.5,
    50,
    50,
    fragmentShader1(),
    vertexShader4(),
    uniforms
  );
  PlanoShader(
    -1.5,
    0,
    0,
    1.5,
    1.5,
    50,
    50,
    fragmentShader1(),
    vertexShader3(),
    uniforms
  );
  PlanoShader(
    1.5,
    0,
    0,
    1.5,
    1.5,
    50,
    50,
    fragmentShader2(),
    vertexShader3(),
    uniforms
  );

  //Mapa de dfesplazamianeot
  let mapsx, mapsy;
  const loader = new THREE.TextureLoader();
  //Mapa de elevación fuente https://visibleearth.nasa.gov/images/73934/topography
  const tx = loader.load("src/Canarias_gebco.png", (texture) => {
    // Callback cuando la textura se carga
    console.log("Ancho:", texture.image.width);
    console.log("Alto:", texture.image.height);
    //Plano manteniendo proporciones de la textura de entrada
    mapsy = 2.5;
    mapsx = (mapsy * texture.image.width) / texture.image.height;

    uniformsM = {
      displacementMap: { value: tx },
      displacementScale: { value: 0.25 },
      u_time: {
        type: "f",
        value: 0.0,
      },
    };

    PlanoShader(
      0,
      -2.5,
      0,
      mapsx,
      mapsy,
      100,
      100,
      fragmentShader3(),
      vertexShader5(),
      uniformsM
    );
  });

  //Orbit control y rejilla
  camcontrols1 = new OrbitControls(camera, renderer.domElement);
  grid = new THREE.GridHelper(20, 40);
  grid.geometry.rotateX(Math.PI / 2);
  grid.position.set(0, 0, 0.0);
  scene.add(grid);
}

//deformación senoidal en z
function vertexShader1() {
  return `
                  varying vec3 vUv; 
                  varying vec4 modelViewPosition; 
                  
                  void main() {
                    vUv = position; 
                    vUv.z += sin(position.x * 10.0) * 0.2;
                    vec4 modelViewPosition = modelViewMatrix * vec4(vUv, 1.0);
                    gl_Position = projectionMatrix * modelViewPosition; 
                  }
                `;
}

//deformación senoidal en z con efecto temporal
function vertexShader2() {
  return `
                    varying vec3 vUv; 
                    varying vec4 modelViewPosition; 
                    uniform float u_time;
                    
                    void main() {
                      vUv = position; 
                      vUv.z += sin(position.x * 10.0 + u_time) * 0.2;
                      vec4 modelViewPosition = modelViewMatrix * vec4(vUv, 1.0);
                      gl_Position = projectionMatrix * modelViewPosition; 
                    }
                  `;
}

//desplazamiento en x e y por distancia al centro
function vertexShader3() {
  return `
                      varying vec3 vUv; 
                      varying vec4 modelViewPosition; 
                      uniform float u_time;
                      
                      void main() {
                        float dist = length(position.xy);
                        vUv = position; 
                        vUv.z += sin(dist * 10.0 + u_time) * 0.2;
                        vec4 modelViewPosition = modelViewMatrix * vec4(vUv, 1.0);
                        gl_Position = projectionMatrix * modelViewPosition; 
                      }
                    `;
}

//latido
function vertexShader4() {
  return `
                        varying vec3 vUv; 
                        varying vec4 modelViewPosition; 
                        uniform float u_time;
                        
                        void main() {
                          float scale = 1.0 + sin(u_time * 2.0) * 0.1;
                          vUv = position * scale; 
                          vec4 modelViewPosition = modelViewMatrix * vec4(vUv, 1.0);
                          gl_Position = projectionMatrix * modelViewPosition; 
                        }
                      `;
}

//Textura como mapa de desplazamiento
function vertexShader5() {
  return `
      varying vec3 vUv; 
      uniform sampler2D displacementMap;
      uniform float displacementScale;
      
      void main() {
        // Coordenadas UV normalizadas [0, 1]
        vec2 uv = position.xy * 0.25 + 0.5;
        
        // Lee la textura en el vertex shader
        vec4 texColor = texture2D(displacementMap, uv);
        float displacement = texColor.r;
        
        // Desplaza el vértice en Z
        vec3 newPosition = position;
        newPosition.z += displacement * displacementScale;
        
        // Nueva posición al fragment shader
        vUv = newPosition;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }
    `;
}

//Componente azul afectada por valor z
function fragmentShader1() {
  return `
          varying vec3 vUv;

				  void main() {
					  gl_FragColor = vec4(vec3(0.5,0.5,vUv.z*2.),1.0);
				  }
			  `;
}

//Colores con variaciones adectadas por el valor de z
function fragmentShader2() {
  return `
    varying vec3 vUv;
    
    // Función de ruido simple basada en un solo valor
    float hash(float p) {
      return fract(sin(p * 127.1) * 43758.5453);
    }
    
    float noise(float p) {
      float i = floor(p);
      float f = fract(p);
      
      // Suavizado hermite
      float u = f * f * (3.0 - 2.0 * f);
      
      // Interpolación entre valores
      return mix(hash(i), hash(i + 1.0), u);
    }
    
    void main() {
      // Ruido basado solo en Z
      float n = noise(vUv.z * 10.0);
      
      // Factor de color basado en Z + ruido
      float colorFactor = vUv.z * 0.5 + 0.5; // Normalizar Z
      colorFactor += n * 0.8; // Añadir variación de ruido
      
      // Colores topográficos (de bajo a alto)
      vec3 colorDeep = vec3(0.2, 0.15, 0.1);     // Marrón muy oscuro (profundo)
      vec3 colorLow = vec3(0.4, 0.3, 0.2);       // Marrón oscuro (bajo)
      vec3 colorMid = vec3(0.6, 0.5, 0.3);       // Marrón claro (medio)
      vec3 colorHigh = vec3(0.8, 0.75, 0.6);     // Beige (alto)
      vec3 colorPeak = vec3(0.95, 0.95, 0.95);   // Blanco (picos)
      
      // Interpolación de colores en múltiples niveles
      vec3 finalColor;
      
      if(colorFactor < 0.25) {
        // Zonas muy bajas
        finalColor = mix(colorDeep, colorLow, colorFactor * 4.0);
      } else if(colorFactor < 0.5) {
        // Zonas bajas a medias
        finalColor = mix(colorLow, colorMid, (colorFactor - 0.25) * 4.0);
      } else if(colorFactor < 0.75) {
        // Zonas medias a altas
        finalColor = mix(colorMid, colorHigh, (colorFactor - 0.5) * 4.0);
      } else {
        // Zonas altas a picos
        finalColor = mix(colorHigh, colorPeak, (colorFactor - 0.75) * 4.0);
      }
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;
}

//Colores con variaciones adectadas por el valor de z
function fragmentShader3() {
  return `
      varying vec3 vUv;
      
      void main() {
        // Factor de color basado solo en Z
        float colorFactor = vUv.z * 10. ; 
        
        // Colores topográficos (de bajo a alto)
        vec3 colorDeep = vec3(0.2, 0.15, 0.1);     // Marrón muy oscuro (profundo)
        vec3 colorLow = vec3(0.4, 0.3, 0.2);       // Marrón oscuro (bajo)
        vec3 colorMid = vec3(0.6, 0.5, 0.3);       // Marrón claro (medio)
        vec3 colorHigh = vec3(0.8, 0.75, 0.6);     // Beige (alto)
        vec3 colorPeak = vec3(0.95, 0.95, 0.95);   // Blanco (picos)
        
        // Interpolación de colores en múltiples niveles
        vec3 finalColor;
        
        if(colorFactor < 0.25) {
          finalColor = mix(colorDeep, colorLow, colorFactor * 4.0);
        } else if(colorFactor < 0.5) {
          finalColor = mix(colorLow, colorMid, (colorFactor - 0.25) * 4.0);
        } else if(colorFactor < 0.75) {
          finalColor = mix(colorMid, colorHigh, (colorFactor - 0.5) * 4.0);
        } else {
          finalColor = mix(colorHigh, colorPeak, (colorFactor - 0.75) * 4.0);
        }
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;
}

function Esfera(px, py, pz, radio, nx, ny, col) {
  let geometry = new THREE.SphereBufferGeometry(radio, nx, ny);
  let material = new THREE.MeshBasicMaterial({
    color: col,
  });

  let mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(px, py, pz);
  scene.add(mesh);
}

function PlanoShader(px, py, pz, sx, sy, nx, ny, fg_sh, vt_sh, unis) {
  let geometry = new THREE.PlaneGeometry(sx, sy, nx, ny);
  let material = new THREE.ShaderMaterial({
    fragmentShader: fg_sh,
    vertexShader: vt_sh,
    uniforms: unis,
    //wireframe: true,
    side: THREE.DoubleSide,
  });

  let mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(px, py, pz);
  scene.add(mesh);
}

//Bucle de animación
function animationLoop() {
  //Incrementa tiempo
  uniforms.u_time.value += 0.05;

  requestAnimationFrame(animationLoop);

  renderer.render(scene, camera);
}
