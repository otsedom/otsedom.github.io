import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let scene, renderer, camera, camcontrols;
let mapa, mapsx, mapsy;

// Latitud y longitud de los extremos del mapa de la imagen
let minlon = -15.5304,
  maxlon = -15.3656;
let minlat = 28.0705,
  maxlat = 28.1817;
// Dimensiones textura (mapa)
let txwidth, txheight;

let objetos = []
const datosEstaciones = [];


init();
animate();

function init() { 
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  //Posición de la cámara
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camcontrols = new OrbitControls(camera, renderer.domElement);

  //Objeto sobre el que se mapea la textura del mapa
  //Dimensiones por defecto
  mapsx = 5;
  mapsy = 5;
  Plano(0, 0, 0, mapsx, mapsy);
  
  
  //CARGA TEXTURA (MAPA)
  //Ajusta tamalño del plano al de la textura, manteniendo relación de aspecto
  const tx1 = new THREE.TextureLoader().load(
    "https://cdn.glitch.global/341720a6-447a-46ce-b3c9-8002f2955b61/mapaLPGC.png?v=1697723131403",
  
    // Acciones a realizar tras la carga
    function (texture) {
      //Dimensiones, textura
      //console.log(texture.image.width, texture.image.height);      
      mapa.material.map = texture;
      mapa.material.needsUpdate = true;

      txwidth = texture.image.width;
      txheight = texture.image.height;

      //Adapta dimensiones del plano a la textura, manteniendo proporciones
      if (txheight > txwidth) {
        let factor = txheight / txwidth;
        mapa.scale.set(1, factor, 1);
        mapsy *= factor;
      } else {
        let factor = txwidth / txheight;
        mapa.scale.set(factor, 1, 1);
        mapsx *= factor;
      }
    }
  )

  //CARGA DE DATOS
  //Lectura del archivo csv de las estaciones Sitycleta
  fetch("Geolocalización estaciones sitycleta.csv")
    .then(response => {
        if (!response.ok) {
            throw new Error('Error: ' + response.statusText);
        }
        return response.text();
    })
    .then(content => {
        procesarCSVEstaciones(content);
    })
    .catch(error => {
        console.error('Error al cargar el archivo:', error);
    });
  
  function procesarCSVEstaciones(content) {
    const sep = ';';// separador ;
    const filas = content.split('\n');

    // Primera fila es el encabezado, separador ;
    const encabezados = filas[0].split(sep);    
    // Obtiene índices de columnas de interés
    const indices = {
        id: encabezados.indexOf('idbase'),
        nombre: encabezados.indexOf('nombre'),
        lat: encabezados.indexOf('latitud'),
        lon: encabezados.indexOf('altitud')
    };
    console.log(indices)
    
    // Extrae los datos de interés
    for (let i = 1; i < filas.length; i++) {
        const columna = filas[i].split(sep);// separador ;
        if (columna.length > 1) { // No fila vacía
            datosEstaciones.push({
                id: columna[indices.idbase],
                nombre: columna[indices.nombre],
                lat: columna[indices.lat],
                lon: columna[indices.lon]
            });       
          
          //longitudes crecen hacia la derecha, como la x
          let mlon = Mapeo(columna[indices.lon], minlon, maxlon, -mapsx / 2, mapsx / 2);
          //Latitudes crecen hacia arriba, como la y
          let mlat = Mapeo(columna[indices.lat], minlat, maxlat, -mapsy / 2, mapsy / 2);
          Esfera(mlon, mlat, 0, 0.01, 10, 10, 0xff0000);
        }
    }
    console.log('Archivo csv estaciones cargado')    
  }    
}

//valor, rango origen, rango destino
function Mapeo(val, vmin, vmax, dmin, dmax) {
  //Normaliza valor en el rango de partida, t=0 en vmin, t=1 en vmax
  let t = 1 - (vmax - val) / (vmax - vmin);
  return dmin + t * (dmax - dmin);
}

function Esfera(px, py, pz, radio, nx, ny, col) {
  let geometry = new THREE.SphereBufferGeometry(radio, nx, ny);
  let material = new THREE.MeshBasicMaterial({
    color: col,
  });
  let mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(px, py, pz);
  objetos.push(mesh);
  scene.add(mesh);
}

function Plano(px, py, pz, sx, sy) {
  let geometry = new THREE.PlaneBufferGeometry(sx, sy);
  let material = new THREE.MeshBasicMaterial({});
  let mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(px, py, pz);
  scene.add(mesh);
  mapa = mesh;
}

// Función para convertir una fecha en formato DD/MM/YYYY HH:mm, presenmte en archivo de préstamos, a Date
function convertirFecha(fechaStr) {
  const [fecha, hora] = fechaStr.split(' ');
  const [dia, mes, año] = fecha.split('/').map(Number);
  const [horas, minutos] = hora.split(':').map(Number);
  return new Date(año, mes - 1, dia, horas, minutos); // mes es 0-indexado
}


//Bucle de animación
function animate() {  
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
