import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let scene, renderer, camera, camcontrols;
let mapa,
  mapsx,
  mapsy,
  scale = 5;

// Latitud y longitud de los extremos del mapa de la imagen
let minlon = -15.46945,
  maxlon = -15.39203;
let minlat = 28.07653,
  maxlat = 28.18235;
// Dimensiones textura (mapa)
let txwidth, txheight;
let texturacargada = false;

let objetos = [];
//Datos fecha, estaciones, préstamos
const fechaInicio = new Date(2018, 4, 1); //Desde mayo (enero es 0)
let fechaActual;
let totalMinutos = 480, //8:00 como arranque
  fecha2show;
const datosSitycleta = [],
  datosEstaciones = [];

init();
animate();

function init() {
  //Muestra fecha actual como título
  fecha2show = document.createElement("div");
  fecha2show.style.position = "absolute";
  fecha2show.style.top = "30px";
  fecha2show.style.width = "100%";
  fecha2show.style.textAlign = "center";
  fecha2show.style.color = "#fff";
  fecha2show.style.fontWeight = "bold";
  fecha2show.style.backgroundColor = "transparent";
  fecha2show.style.zIndex = "1";
  fecha2show.style.fontFamily = "Monospace";
  fecha2show.innerHTML = "";
  document.body.appendChild(fecha2show);

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

      //Dimensiones, textura
      //console.log(texture.image.width, texture.image.height);
      mapa.material.map = texture;
      mapa.material.needsUpdate = true;

      texturacargada = true;

      //
      //CARGA DE DATOS
      //Antes debe disponerse de las dimensiones de la textura, su carga debe haber finalizado
      //Lectura del archivo csv con localizaciones de las estaciones Sitycleta
      fetch("src/Geolocalización estaciones sitycleta.csv")
        .then((response) => {
          if (!response.ok) {
            throw new Error("Error: " + response.statusText);
          }
          return response.text();
        })
        .then((content) => {
          procesarCSVEstaciones(content);
        })
        .catch((error) => {
          console.error("Error al cargar el archivo:", error);
        });

      //Carga datos de un año de préstamos desde el csv
      fetch("src/SITYCLETA-2018.csv")
        .then((response) => {
          if (!response.ok) {
            throw new Error("Error: " + response.statusText);
          }
          return response.text();
        })
        .then((content) => {
          procesarCSVAlquileres(content);
        })
        .catch((error) => {
          console.error("Error al cargar el archivo:", error);
        });
    } //function Texture
  ); //load
}

//Procesamiento datos csv
function procesarCSVEstaciones(content) {
  const sep = ";"; // separador ;
  const filas = content.split("\n");

  // Primera fila es el encabezado, separador ;
  const encabezados = filas[0].split(sep);
  // Obtiene índices de columnas de interés
  const indices = {
    id: encabezados.indexOf("idbase"),
    nombre: encabezados.indexOf("nombre"),
    lat: encabezados.indexOf("latitud"),
    lon: encabezados.indexOf("altitud"),
  };
  console.log(indices);

  // Extrae los datos de interés
  for (let i = 1; i < filas.length; i++) {
    const columna = filas[i].split(sep); // separador ;
    if (columna.length > 1) {
      // No fila vacía
      datosEstaciones.push({
        id: columna[indices.idbase],
        nombre: columna[indices.nombre],
        lat: columna[indices.lat],
        lon: columna[indices.lon],
      });

      //longitudes crecen hacia la derecha, como la x
      let mlon = Map2Range(
        columna[indices.lon],
        minlon,
        maxlon,
        -mapsx / 2,
        mapsx / 2
      );
      //Latitudes crecen hacia arriba, como la y
      let mlat = Map2Range(
        columna[indices.lat],
        minlat,
        maxlat,
        -mapsy / 2,
        mapsy / 2
      );
      //Esfera en posición estaciones
      Esfera(mlon, mlat, 0, 0.01, 10, 10, 0x009688);
    }
  }
  console.log("Archivo csv estaciones cargado");
}

function procesarCSVAlquileres(content) {
  const sep = ";"; // separador ;
  const filas = content.split("\n");

  // Primera fila es el encabezado, separador ;
  const encabezados = filas[0].split(sep);

  // Obtiene índices de columnas de interés
  const indices = {
    t_inicio: encabezados.indexOf("Start"),
    t_fin: encabezados.indexOf("End"),
    p_inicio: encabezados.indexOf("Rental place"),
    p_fin: encabezados.indexOf("Return place"),
  };

  // Extrae los datos de interés
  for (let i = 1; i < filas.length; i++) {
    const columna = filas[i].split(sep);
    if (columna.length > 1) {
      // No fila vacía
      datosSitycleta.push({
        t_inicio: convertirFecha(columna[indices.t_inicio]),
        t_fin: convertirFecha(columna[indices.t_fin]),
        p_inicio: columna[indices.p_inicio],
        p_fin: columna[indices.p_fin],
      });
    }
  }
  console.log("Archivo csv alquileres cargado");
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
  let material = new THREE.MeshBasicMaterial({
    color: col,
  });
  let mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(px, py, pz);
  objetos.push(mesh);
  scene.add(mesh);
}

function Plano(px, py, pz, sx, sy) {
  let geometry = new THREE.PlaneGeometry(sx, sy);
  let material = new THREE.MeshBasicMaterial({});
  let mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(px, py, pz);
  scene.add(mesh);
  mapa = mesh;
}

// Función para convertir una fecha en formato DD/MM/YYYY HH:mm, presenmte en archivo de préstamos, a Date
function convertirFecha(fechaStr) {
  const [fecha, hora] = fechaStr.split(" ");
  const [dia, mes, año] = fecha.split("/").map(Number);
  const [horas, minutos] = hora.split(":").map(Number);
  return new Date(año, mes - 1, dia, horas, minutos); // mes es 0-indexado
}

function actualizarFecha() {
  totalMinutos += 1;
  // Añade fecha de partida
  fechaActual = new Date(fechaInicio.getTime() + totalMinutos * 60000);

  // Formatea salida
  const opciones = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  };
  //Modifica en pantalla
  fecha2show.innerHTML = fechaActual.toLocaleString("es-ES", opciones);
}

//Paradas con p´restamo activo en un momento dado
function filtraparadasActivas() {
  //Filtra registros activos
  const registrosFiltrados = datosSitycleta.filter((registro) => {
    return registro.t_inicio <= fechaActual && registro.t_fin >= fechaActual;
  });

  //Hay alquileres activos a esa hora
  if (registrosFiltrados.length > 0) {
    //Parada de inicio de alquileres activos
    const estacionesA = new Set(
      registrosFiltrados.map((registro) => registro.p_inicio)
    );
    //Parada de fin de alquileres activos
    const estacionesB = new Set(
      registrosFiltrados.map((registro) => registro.p_fin)
    );

    let i = 0;
    //Altera tamaño y color de las estaciones con alquiler activo, o lo recupera
    for (const estacion of datosEstaciones) {
      if (
        estacionesA.has(estacion.nombre) ||
        estacionesB.has(estacion.nombre)
      ) {
        //Varío color según casos
        if (
          estacionesA.has(estacion.nombre) &&
          estacionesB.has(estacion.nombre)
        )
          objetos[i].material.color.set(0x005aa0);
        else {
          if (estacionesA.has(estacion.nombre))
            objetos[i].material.color.set(0x8a2be2);
          else objetos[i].material.color.set(0xc81e3c);
        }
        objetos[i].scale.set(2, 2, 2);
      } else {
        //Vuelve a l estado por defecto
        objetos[i].material.color.set(0x009688);
        objetos[i].scale.set(1, 1, 1);
      }
      i++;
    }
  }
}

//Bucle de animación
function animate() {
  if (texturacargada) {
    //Actualiza hora actual
    actualizarFecha();
    //Filtra alquileres activos y destaca estaciones afectadas
    filtraparadasActivas();
  }

  requestAnimationFrame(animate);

  renderer.render(scene, camera);
}
