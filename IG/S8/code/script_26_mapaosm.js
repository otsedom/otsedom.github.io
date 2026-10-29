import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";

let scene, renderer;
let camera;
let camcontrols;
let objetos = [];

let nodes = [],
  ways = [],
  relations = [];
// Latitud y longitud de los extremos del mapa (textura))
let minlon = -15.46945,
  maxlon = -15.39203;
let minlat = 28.07653,
  maxlat = 28.18235;
let mapa,
  mapsx,
  mapsy,
  scale = 15,
  heightscale = 300;
let t0;

init();
animationLoop();

function init() {
  //Defino cámara
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    20,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 10);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  //CARGA TEXTURA (MAPA)
  //Crea plano, ajustando su tamaño al de la textura, manteniendo relación de aspecto
  const tx1 = new THREE.TextureLoader().load(
    "src/mapaLPGC.png",

    // Acciones a realizar tras la carga
    function (texture) {
      //Objeto sobre el que se mapea la textura del mapa
      //Plano para mapa manteniendo proporciones de la textura de entrada
      const txaspectRatio = texture.image.width / texture.image.height;
      mapsy = scale;
      mapsx = mapsy * txaspectRatio;
      Plano(0, 0, 0, mapsx, mapsy);
      console.log("Dimensiones  " + mapsx + ", " + mapsy);
      //Dimensiones, textura
      //console.log(texture.image.width, texture.image.height);
      mapa.material.map = texture;
      mapa.material.needsUpdate = true;

      //Necesita tener la textura cargada para proceder con colocación objetos
      CargaOSM();
    }
  );

  //OrbitControls
  camcontrols = new OrbitControls(camera, renderer.domElement);
  //TrackballControls
  //camcontrols = new TrackballControls(camera, renderer.domElement);

  t0 = new Date();
}

function CargaOSM() {
  //CARGA OSM
  //Lectura datos xml
  var loader = new THREE.FileLoader();
  //loader.load("src/mapLPGC_MyL.osm", function (text) {
  loader.load("src/mapLPGC_MyL2025.osm", function (text) {
    //Fuente https://www.w3schools.com/xml/xml_parser.asp
    var text, parser, xmlDoc;
    parser = new DOMParser();
    //xmlDoc = parser.parseFromString(text, "text/xml"); //fallan con versión 2025!!
    xmlDoc = parser.parseFromString(text, "application/xml");

    // Diccionario de nodos para acceso rápido
    //const nodeElements = xmlDoc.querySelectorAll("node");
    const nodeMap = new Map();
    for (let nd of xmlDoc.querySelectorAll("node")) {
      nodeMap.set(nd.getAttribute("id"), {
        lat: parseFloat(nd.getAttribute("lat")),
        lon: parseFloat(nd.getAttribute("lon")),
        tags: Array.from(nd.querySelectorAll("tag")).map((tag) => ({
          k: tag.getAttribute("k"),
          v: tag.getAttribute("v"),
        })),
      });
    }

    console.log(`Nodos cargados: ${nodeMap.size}`);

    // Colores por tipo de edificio
    const buildingColors = {
      residential: 0xdee5f0,
      house: 0xcddaf5,
      apartments: 0xbac6f2,
      commercial: 0xffd180,
      retail: 0xffc266,
      industrial: 0xd1c4e9,
      warehouse: 0xb39ddb,
      school: 0xffcc80,
      university: 0xffb74d,
      hospital: 0xff9999,
      church: 0xff0000, //0xe0b0ff,
      public: 0x9bd1a0,
      default: 0xdedede,
    };

    // Procesa los elementos "way"
    const wayElements = xmlDoc.querySelectorAll("way");
    const ways = [];

    for (let way of wayElements) {
      const tags = way.querySelectorAll("tag");
      let interest = 0;
      let height = 10 + THREE.MathUtils.randFloat(-3, 3); // altura por defecto
      let levels = 0;
      let buildingType = "default";

      // Clasificación del elemento
      for (let tag of tags) {
        const k = tag.getAttribute("k");
        const v = tag.getAttribute("v");

        if (k === "highway") {
          interest = 1; // carretera
          break;
        }
        if (k === "building") {
          interest = 2; // edificio
          if (v) buildingType = v;
          break;
        }
        if (k === "height") {
          const val = parseFloat(v);
          if (!isNaN(val)) height = val;
        }
        if (k === "building:levels") {
          const val = parseFloat(v);
          if (!isNaN(val)) levels = val;
        }
      }

      if (interest === 0) continue;

      // Si hay niveles y no hay altura especificada de forma explícita
      if (levels > 0 && (height === 10 || isNaN(height))) {
        height = levels * 3; // 3 m por planta por defecto
      }

      // Obtiene los nodos asociados desde el diccionario
      const nds = way.querySelectorAll("nd");
      const points = [];

      for (let nd of nds) {
        const ref = nd.getAttribute("ref");
        const node = nodeMap.get(ref);
        if (!node) continue;

        const { lat, lon } = node;

        const mlon = Map2Range(lon, minlon, maxlon, -mapsx / 2, mapsx / 2);
        const mlat = Map2Range(lat, minlat, maxlat, -mapsy / 2, mapsy / 2);

        // Nodo visual opcional (solo si quieres verlos)
        //Esfera(mlon, mlat, 0, 0.0002, 10, 10, 0x000000);

        points.push(new THREE.Vector3(mlon, mlat, 0));
      }

      if (points.length === 0) continue;
      ways.push(way.getAttribute("id"));

      // Diferentes geometrías según tipo
      if (interest === 1) {
        // Carretera
        const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        scene.add(line);
      } else if (interest === 2) {
        // Edificio
        const shape = new THREE.Shape();
        shape.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          shape.lineTo(points[i].x, points[i].y);
        }

        const extrudeSettings = {
          steps: 1,
          depth: height / heightscale, //aplicar aquí escala, y no al asignar las alturas
          //depth: 0.02 + THREE.MathUtils.randFloat(-0.005, 0.005),
          bevelEnabled: false,
        };

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

        // Color según tipo de edificio
        let baseColor = buildingColors[buildingType] || buildingColors.default;
        const c = new THREE.Color(baseColor);

        // Pequeña variación aleatoria del tono o luminosidad en HSL para diferenciar edificios vecinos
        const hsl = {};
        c.getHSL(hsl);
        hsl.h += THREE.MathUtils.randFloat(-0.03, 0.03);
        hsl.l += THREE.MathUtils.randFloat(-0.05, 0.05);
        c.setHSL(hsl.h, hsl.s, hsl.l);

        //const material = new THREE.MeshLambertMaterial({ color: c });*/

        let bmaterial = new THREE.LineBasicMaterial({ color: c });

        const mesh = new THREE.Mesh(geometry, bmaterial);
        scene.add(mesh);
      }
    }

    // Árboles
    for (let [id, node] of nodeMap) {
      if (!node.tags || node.tags.length === 0) continue;
      const tag = node.tags.find((t) => t.k === "natural" && t.v === "tree");
      if (!tag) continue;

      const mlon = Map2Range(node.lon, minlon, maxlon, -mapsx / 2, mapsx / 2);
      const mlat = Map2Range(node.lat, minlat, maxlat, -mapsy / 2, mapsy / 2);

      if (tag) {
        // Árbol como cilindro verde
        const geom = new THREE.CylinderGeometry(
          0.001,
          0.001,
          3 / heightscale,
          8
        );
        const mat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const tree = new THREE.Mesh(geom, mat);
        tree.rotation.x = Math.PI / 2; // Rota 90° en X
        tree.position.set(mlon, mlat, 0);
        scene.add(tree);
      }
    }

    console.log(`Procesados ${ways.length} elementos de interés`);
  });
}

//Dados los límites del mapa del latitud y longitud, mapea posiciones en ese rango
//valor, rango origen, rango destino
function Map2Range(val, vmin, vmax, dmin, dmax) {
  //Normaliza valor en el rango de partida, t=0 en vmin, t=1 en vmax
  let t = 1 - (vmax - val) / (vmax - vmin);
  return dmin + t * (dmax - dmin);
}

function Esfera(px, py, pz, radio, nx, ny, col) {
  let geometry = new THREE.SphereBufferGeometry(radio, nx, ny);
  let material = new THREE.MeshBasicMaterial({});

  let mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(px, py, pz);
  scene.add(mesh);
  objetos.push(mesh);
}

function Plano(px, py, pz, sx, sy) {
  let geometry = new THREE.PlaneBufferGeometry(sx, sy);
  let material = new THREE.MeshBasicMaterial({});
  let mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(px, py, pz);
  scene.add(mesh);
  mapa = mesh;
}

//Bucle de animación
function animationLoop() {
  requestAnimationFrame(animationLoop);

  //TrackballControls
  let t1 = new Date();
  let secs = (t1 - t0) / 1000;
  camcontrols.update(1 * secs);

  renderer.render(scene, camera);
}
