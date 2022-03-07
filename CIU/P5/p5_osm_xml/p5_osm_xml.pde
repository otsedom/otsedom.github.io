XML xml;
XML extremos;
HashMap<String, XML> nodes;
HashMap<String, XML> ways;
HashMap<String, XML> relations;

float minlat;
float minlon;
float maxlat;
float maxlon;

//Variables de traslación y escalado
int x;
int y;
int scale;
float zoom;

//Paleta de colores para edificios
int ncolors = 50;
color[] colors;

//Elementos para el dibujo
PShape[] eltos;
boolean[] dibujable;

//Método necesario si size se define con parámetros
void settings() {
  //Carga del archivo descargado de OSM
  xml = loadXML("mapLPGC_MyL.osm");

  extremos = xml.getChildren("bounds")[0];
  nodes = new HashMap<String, XML>();
  ways = new HashMap<String, XML>();
  relations = new HashMap<String, XML>();

  for (XML node : xml.getChildren("node")) nodes.put(node.getString("id"), node);
  for (XML way : xml.getChildren("way")) ways.put(way.getString("id"), way);
  for (XML relation : xml.getChildren("relations")) relations.put(relation.getString("relation"), relation);
  //Obtiene límites en latitud y ongitud del mapa
  minlat = extremos.getFloat("minlat");
  minlon = extremos.getFloat("minlon");
  maxlat = extremos.getFloat("maxlat");
  maxlon = extremos.getFloat("maxlon");
  println("Mapa con longitud (", minlon + ", " + maxlon + ") y latitud " + "(", minlat + ", " + maxlat + ")");
  println("Obtenidos " + ways.size() + " elementos");
  
  //Fuerzo sx píxeles de ancho de la ventana
  int sx = 1000;
  scale = (int)(sx/(maxlon - minlon));
  size(sx, (int)((maxlat - minlat) * scale), P3D);  
}

void setup() {
  stroke(255);
  
  //Desplazamiento y zoom
  x = 0;
  y = 0;
  zoom = 1;
  //Paleta de colores aleatorios para relleno de edificios
  colors = new color[ncolors];
  for (int i=0;i<ncolors;i++)
    colors[i]=color(random(255), random(255), random(255));
    
  //Crea los PShape  
  creaEltos();
}

void draw() {
  background(0);

  //Traslada con botón izquierdo del ratón
  if (mousePressed && mouseButton == LEFT) {
    x += (mouseX - pmouseX)/zoom;
    y += (mouseY - pmouseY)/zoom;
  }

  //Dibuja elementos del mapa escogidos
  pushMatrix();
  //Origen en el centro de la ventana
  translate(width/2,height/2,0);
  scale(zoom);
  //Traslada al centro del mapa leído
  translate(-(minlon+maxlon)/2 * scale + x, (minlat+maxlat)/2 * scale + y);
  //Dibuja los elementos escogidos
  for (int i=0;i<ways.size();i++){
    if (dibujable[i])
      shape(eltos[i]);
  }
  popMatrix();

  //Muestra FPS
  textSize(30); 
  text("FPS: " + nf(frameRate, 0, 1), 10, 40);
}

//Del total de ways cargados, selecciona en base a tags 
void creaEltos(){
  //Estructura de datos usada en draw
  eltos = new PShape[ways.size()];
  dibujable = new boolean[ways.size()];
  
  //Recorremos los elementos cargados en la estructura HashMap
  int nelto = 0;
  for (XML way : ways.values()) {
    eltos[nelto] = createShape();
    dibujable[nelto] = false;
    
    //Selecciono algunos tags de interés paar mostrar elementos que los tienen
    //Relación de tags de OSM https://wiki.openstreetmap.org/wiki/Tags
    boolean edificio = false;
    boolean calle = false;
    boolean bici = false;
    for (XML tag : way.getChildren("tag")) {
      String tipok = tag.getString("k");
      String tipov = tag.getString("v");
      if (tipok.equals("building")){
        edificio = true;
      }
      if (tipok.equals("highway")){
        calle = true;
      }
      if (tipok.equals("bicycle") || tipov.equals("cycleway")){
        bici = true;
      }
    }
    //Si es de interés, configuro pincel y relleno y creo los vértices
    if (edificio || calle  || bici){
      dibujable[nelto] = true;
      //Creación de forma con sus características de color
      eltos[nelto].beginShape();
      if (edificio){
        eltos[nelto].noStroke();
        eltos[nelto].fill(colors[nelto % ncolors]);
      }
      else{
        eltos[nelto].noFill();
        if (bici)
          eltos[nelto].stroke(0,255,0);
        else
          eltos[nelto].stroke(255);
      }
      eltos[nelto].strokeWeight(2);
      
      //Los vértices
      for (XML nd : way.getChildren("nd")) {
        XML node = nodes.get(nd.getString("ref"));
        
        float lat = node.getFloat("lat");
        float lon = node.getFloat("lon");        
        eltos[nelto].vertex(lon * scale, -lat * scale);
      }      
      eltos[nelto].endShape();      
    }
    nelto++;
  }
}

//Modificar el zoom del mapa
void mouseWheel(MouseEvent event) {
  float e = event.getCount();
  zoom += e/10;
  if (zoom<1)
    zoom = 1;
}
