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

  //Plano con Mapa de desplazamiento zona Canarias
  let mapsx, mapsy;
  const loader = new THREE.TextureLoader();
  //Mapa de elevación fuente https://visibleearth.nasa.gov/images/73934/topography
  const tx = loader.load("src/Canarias_gebco.png", (texture) => {
    // Callback cuando la textura se carga
    console.log("Ancho:", texture.image.width);
    console.log("Alto:", texture.image.height);
    //Plano manteniendo proporciones de la textura de entrada
    mapsy = 4;
    mapsx = (mapsy * texture.image.width) / texture.image.height;

    //Variables uniform para mapa
    uniformsM = {
      displacementMap: { value: tx },
      displacementScale: { value: 0.25 },
      uSize: { value: new THREE.Vector2(mapsx, mapsy) },
      uGrid: { value: 100 },
      uSea: { value: 0.001 }, // nivel del mar sobre la altura normalizada (0..1)
      uNoiseAmp: { value: 0.05 }, // intensidad ruido relieve
      uNoiseFreq: { value: 40.0 }, // tamaño de los accidentes aleatorios
      uColFreq: { value: 150.0 }, // tamaño del ruido de color
      uSeed: { value: Math.random() * 100.0 },
      uLightDir: { value: new THREE.Vector3(0.5, 0.6, 0.8).normalize() },
      u_time: {
        type: "f",
        value: 0.0,
      },
    };

    PlanoShader(0,0,0,mapsx,mapsy,100,100,
      fragmentShader(),vertexShader(),uniformsM);
  });

  //Orbit control y rejilla
  camcontrols1 = new OrbitControls(camera, renderer.domElement);
  grid = new THREE.GridHelper(20, 40);
  grid.geometry.rotateX(Math.PI / 2);
  grid.position.set(0, 0, 0.0);
  scene.add(grid);

  window.addEventListener("keydown", teclas);
}

//Teclas
function teclas(e) {
  if (!uniformsM) return;
  //R nueva semilla
  if (e.key === "r" || e.key === "R") {
    uniformsM.uSeed.value = Math.random() * 100.0;
    // + - más o menos aleatoriedad en el relieve
  } else if (e.key === "+") {
    uniformsM.uNoiseAmp.value = Math.min(0.05, uniformsM.uNoiseAmp.value + 0.002);
  } else if (e.key === "-") {
    uniformsM.uNoiseAmp.value = Math.max(0, uniformsM.uNoiseAmp.value - 0.002);
    // W / S nivel del mar
  } else if (e.key === "w" || e.key === "W") {
    uniformsM.uSea.value = Math.min(0.5, uniformsM.uSea.value + 0.01);
  } else if (e.key === "s" || e.key === "S") {
    uniformsM.uSea.value = Math.max(0, uniformsM.uSea.value - 0.01);
  }
}


//Textura como mapa de desplazamiento + ruido aleatorio
function vertexShader() {
  return `
      uniform sampler2D displacementMap;
      uniform float displacementScale;
      uniform vec2 uSize;
      uniform float uGrid;
      uniform float uSea;
      uniform float uNoiseAmp;
      uniform float uNoiseFreq;
      uniform float uSeed;

      varying vec2 vUv;
      varying float vH;
      varying vec3 vNormalW;

      float random (in vec2 st) {
        return fract(sin(dot(st.xy,
                             vec2(12.9898, 78.233)))
                     * 43758.5453123);
      }

      float vnoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(random(i),                  random(i + vec2(1.0, 0.0)), u.x),
                   mix(random(i + vec2(0.0, 1.0)), random(i + vec2(1.0, 1.0)), u.x),
                   u.y);
      }

      // Ruido aleatorio en [-1, 1] con varias octavas
      float rnd(vec2 p) {
        p = p * uNoiseFreq + uSeed;
        float n = vnoise(p) * 0.5
                + vnoise(p * 2.0) * 0.25
                + vnoise(p * 4.0) * 0.125;
        return n * 2.0 - 1.0;
      }

      // Altura: mapa de desplazamiento + perturbación aleatoria (el mar queda plano)
      float altura(vec2 uv) {
        float h = texture2D(displacementMap, uv).r;
        float tierra = smoothstep(uSea, uSea + 0.03, h);
        return max(h, uSea) * displacementScale + rnd(uv) * uNoiseAmp * tierra;
      }

      void main() {
        vUv = uv;
        vH = texture2D(displacementMap, uv).r;

        // ALtura desde el mapa de desplazamiento aplicando ruido
        float z = altura(uv);

        // Normal por diferencias finitas sobre la altura tras aplicar ruido
        float e = 1.0 / uGrid;
        float hx = (altura(uv + vec2(e, 0.0)) - altura(uv - vec2(e, 0.0))) / (2.0 * e * uSize.x);
        float hy = (altura(uv + vec2(0.0, e)) - altura(uv - vec2(0.0, e))) / (2.0 * e * uSize.y);
        vNormalW = normalize(vec3(-hx, -hy, 1.0));

        vec3 newPosition = position;
        newPosition.z += z;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }
    `;
}

//Colores por altura y pendiente (agua, arena, hierba, bosque, roca, nieve) con ruido
function fragmentShader() {
  return `
      uniform vec3 uLightDir;
      uniform float uSea;
      uniform float uColFreq;
      uniform float uSeed;

      varying vec2 vUv;
      varying float vH;
      varying vec3 vNormalW;

      float random (in vec2 st) {
        return fract(sin(dot(st.xy,
                             vec2(12.9898, 78.233)))
                     * 43758.5453123);
      }

      float vnoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(random(i),                  random(i + vec2(1.0, 0.0)), u.x),
                   mix(random(i + vec2(0.0, 1.0)), random(i + vec2(1.0, 1.0)), u.x),
                   u.y);
      }

      // Ruido en [-1, 1] por fragmento
      float rnd(vec2 p) {
        p = p * uColFreq + uSeed;
        float n = vnoise(p) * 0.5
                + vnoise(p * 2.0) * 0.25
                + vnoise(p * 4.0) * 0.125;
        return n * 2.0 - 1.0;
      }

      void main() {
        vec3 n = normalize(vNormalW);
        //Obtiene ruido
        float r = rnd(vUv);

        //Paleta de colores
        vec3 agua   = vec3(0.10, 0.30, 0.55);
        vec3 arena  = vec3(0.85, 0.78, 0.55);
        vec3 hierba = vec3(0.25, 0.50, 0.20);
        vec3 bosque = vec3(0.12, 0.33, 0.14);
        vec3 roca   = vec3(0.45, 0.42, 0.40);
        vec3 nieve  = vec3(0.95, 0.96, 1.00);

        vec3 col;
        //En función de la altura
        if (vH <= uSea) {
          // agua: más oscura cuanto más profunda, con ligera variación
          float prof = clamp(vH / max(uSea, 0.001), 0.0, 1.0);
          col = mix(agua * 0.6, agua * 1.3, prof);
          col *= 1.0 + r * 0.06;
        } else {
          // si no es mar
          // 0 costa, 1 cota máxima del mapa
          float t = (vH - uSea) / max(1.0 - uSea, 0.001);
          // ruido desplaza los límites entre zonas evitando líneas perfectas
          t += r * 0.04;

          //mezcla
          col = mix(arena, hierba, smoothstep(0.01, 0.05, t));
          col = mix(col, bosque, smoothstep(0.10, 0.30, t));
          col = mix(col, roca,   smoothstep(0.40, 0.60, t));
          col = mix(col, nieve,  smoothstep(0.85, 0.95, t));

          // pendientes acusadas se ven como roca
          float pend = 1.0 - n.z;
          col = mix(col, roca, smoothstep(0.03, 0.12, pend + r * 0.02) * (1.0 - smoothstep(0.85, 0.95, t)));

          // variación aleatoria de color en tierra
          col *= 1.0 + r * 0.2;
        }

        // Iluminación difusa con la normal del relieve perturbado
        float diff = max(dot(n, uLightDir), 0.0);
        col *= 0.35 + 0.8 * diff;

        gl_FragColor = vec4(col, 1.0);
      }
    `;
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
