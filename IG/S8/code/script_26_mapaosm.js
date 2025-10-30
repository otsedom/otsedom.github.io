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
  scale = 15;
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
    //xmlDoc = parser.parseFromString(text, "text/xml"); //fallan con versi´´on 2025!!
    xmlDoc = parser.parseFromString(text, "application/xml");

    // Recorremos xml
    //Elementos nodes para cada referencia contyienen latitud y longitud
    let nodes = xmlDoc.getElementsByTagName("node");
    //Elementos relations (no se utilizan)
    let relations = xmlDoc.getElementsByTagName("relations");
    //Accede a los elementos ways
    var x = xmlDoc.getElementsByTagName("way");
    //Recorro los elementos buscando aquellos que sean highway o building
    for (let i = 0; i < x.length; i++) {
      ways.push(x[i].getAttribute("id"));
      let tags = x[i].getElementsByTagName("tag");
      let interest = 0; //Por defecto no es elemento de interés
      let height = 0; //Por defecto altura 0
      //Recorro tags del elemento way
      for (let j = 0; j < tags.length; j++) {
        if (tags[j].hasAttribute("k")) {
          if (tags[j].getAttribute("k") == "highway") {
            interest = 1;
            break;
          }
          if (tags[j].getAttribute("k") == "building") {
            interest = 2;
            break;
          }
        }
      }
      //Si el elemento way es  de interés
      if (interest > 0) {
        const hmaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
        const points = [];

        //Recorre los nodos del elemento
        let nds = x[i].getElementsByTagName("nd");
        for (let k = 0; k < nds.length; k++) {
          let ref = nds[k].getAttribute("ref");

          //Probablemente hay mejores formas con xmlDoc.querySelector
          //de momento busco referencia de forma iterativa a mano para obtener coordenaas
          for (let nd = 0; nd < nodes.length; nd++) {
            if (nodes[nd].getAttribute("id") == ref) {
              let lat = Number(nodes[nd].getAttribute("lat"));
              let lon = Number(nodes[nd].getAttribute("lon"));
              //longitudes crecen hacia la derecha, como la x
              let mlon = Map2Range(lon, minlon, maxlon, -mapsx / 2, mapsx / 2);
              //Latitudes crecen hacia arriba, como la y
              let mlat = Map2Range(lat, minlat, maxlat, -mapsy / 2, mapsy / 2);
              //Crea esfera del nodo del elemento
              Esfera(mlon, mlat, 0, 0.002, 10, 10, 0xffffff);
              //Añade punto
              points.push(new THREE.Vector3(mlon, mlat, 0));
              //Nodo localizado, no sigue recorriendo
              break;
            }
          }
        }

        //Según elemento de interés crea objeto
        let line;
        if (interest == 1) {
          //highways
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          line = new THREE.Line(geometry, hmaterial);
          scene.add(line);
        } else {
          if (interest == 2) {
            //Buildings
            const shape = new THREE.Shape();
            shape.autoClose = true;
            //Objeto por extrusión
            for (let np = 0; np < points.length; np++) {
              if (np > 0) shape.lineTo(points[np].x, points[np].y);
              else shape.moveTo(points[np].x, points[np].y);
            }

            const extrudeSettings = {
              steps: 1,
              depth: 0.02 + THREE.MathUtils.randFloat(-0.005, 0.005),
              //depth: 0.2 + height,
              bevelThickness: 0,
              bevelSize: 0,
            };

            const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

            let bmaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
            let c = new THREE.Color();
            c.set(THREE.MathUtils.randInt(0, 65535));
            c.getHexString();
            bmaterial.color = c;
            const mesh = new THREE.Mesh(geometry, bmaterial);
            scene.add(mesh);
          }
        }
      }
    }

    console.log("Obtenidos " + ways.length + " elementos");
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
