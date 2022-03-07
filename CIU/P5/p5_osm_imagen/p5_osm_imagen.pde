PGraphics lienzo;
PImage img;

float minlat,minlon,maxlat,maxlon;

float[] lats,lons;
String[] nombres;
int nest = 0;
int r = 5;

float zoom;
//int px,py;
int x;
int y;

Table Estaciones;

void setup() {
  size(800, 800, P3D);
  
  //Cargamos información de estaciones de préstamo
  Estaciones = loadTable("Geolocalización estaciones sitycleta.csv", "header");
  //Estaciones.getRowCount() contiene el número de entradas
  //Creamos estruatura paar almacenar lo que nos interesa
  lats = new float[Estaciones.getRowCount()];
  lons = new float[Estaciones.getRowCount()];
  nombres = new String[Estaciones.getRowCount()];
  //Almacenamos datos en nuestra estructura
  nest = 0;
  for (TableRow est : Estaciones.rows()) {
    nombres[nest] = est.getString("nombre");
    lats[nest] = float(est.getString("latitud"));
    lons[nest] = float(est.getString("altitud"));
    
    println(nombres[nest], lats[nest], lons[nest]);
    nest++;
  }
  
  //Imagen del Mapa
  img=loadImage("mapaLPGC.png");
  //Creamos lienzo par el mapa
  lienzo = createGraphics(img.width ,img.height);
  lienzo.beginDraw();
  lienzo.background(100);
  lienzo.endDraw();
  
  //Latitud y longitud de los extremos del mapa de la imagen
  minlon = -15.5304;
  maxlon = -15.3656;
  minlat = 28.0705;
  maxlat = 28.1817;
  
  //Inicializa desplazamiento y zoom
  x = 0;
  y = 0;
  zoom = 1;
  
  //Compone imagen con estaciones sobre el lienzo
  dibujaMapayEstaciones();  
}

void draw() {
  background(220);
  //Desplazamiento con botón izquierdo ratón
  if (mousePressed && mouseButton == LEFT) {
    x += (mouseX - pmouseX)/zoom;
    y += (mouseY - pmouseY)/zoom;
  }

    
  //Coloca origen en el centro
  translate(width/2,height/2,0);
  //Escala según el zoom
  scale(zoom);
  //Centro de la imagen en el origen
  translate(-img.width/2+x,-img.height/2+y);
  
  image(lienzo, 0,0);
}

//Rueda del ratón para modificar el zoom
void mouseWheel(MouseEvent event) {
  float e = event.getCount();
  zoom += e/10;
  if (zoom<1)
    zoom = 1;
}

void dibujaMapayEstaciones(){
  //Dibuja sobre el lienzo
  lienzo.beginDraw();
  //Imagen de fondo
  lienzo.image(img, 0,0,img.width,img.height); 
  //Círculo y etiqueta de cada estación según latitud y longitud
  for (int i=0;i<nest;i++){
    float mlon = map(lons[i], minlon, maxlon, 0, img.width);
    //latitud invertida con respecto al eje y de la ventana
    float mlat = map(lats[i], maxlat, minlat, 0, img.height);
  
    lienzo.fill(0,255,0);
    lienzo.ellipse(mlon, mlat, r, r); 
    lienzo.fill(0,0,0);
    lienzo.text(nombres[i], mlon+r*2,mlat);
  }   
  lienzo.endDraw();
}
