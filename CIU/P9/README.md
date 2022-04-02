## Práctica 9. Arduino y Processing

### Contenidos

[Comunicaciones](#91-comunicaciones)  
[Lectura de sensores en Arduino](#92-lectura-de-sensores-en-arduino)  
[Comunicación entre Arduino y Processing](#93-comunicación-entre-arduino-y-processing)  
[Algunas fuentes y ejemplos](#94-algunas-fuentes-y-ejemplos)  
[Tarea](#95-tarea)  


### 9.1 Comunicaciones

La forma más simple de interaccionar con Arduino es a través de las funciones de comunicación serial. El conjunto de funciones que se pueden utilizar es el siguiente:

- *if(Serial)*
- *available()*, *availableForWrite()*
- *begin()*, *end()*
- *find()*, *findUntil()*
- *flush()*
- *parseFloat()*, *parseInt()*
- *peek()*
- *print()*, *println()*
- *read()*, *readBytes()*, *readBytesUntil()*, *readString()*, *readStringUntil()*
- *setTimeout()*
- *write()*
- *serialEvent()*

El siguiente listado muestra el envío de un mensaje simple a través del puerto serial. El resultado se puede visualizar utilizando el monitor serial que proporciona el IDE de Arduino.

*Arduino serial W*
```
//Ejemplo de envío de mensaje por el puerto serial con Arduino

int n;

void setup()
{
  //initialize serial communications at a 9600 baud rate
  Serial.begin(9600);
}
void loop()
{
  n = n+1;

  //send 'Hello n' over the serial port
  Serial.print("Hello ");
  Serial.println(n);
  //wait 1 second
  delay(1000);
}

```

### 9.2 Lectura de sensores en Arduino

#### 9.2.1 Conversión analógica/digital

La tarjeta dispone de entradas en voltaje (máximo 5 voltios) que pueden ser convertidas a valores digitales por medio de un conversor A/D de 10 bits. También es posible generar valores analógicos de salida en forma de salida PWM (ciclo de trabajo variable). Las funciones que permiten operar con estas señales son las siguientes:

- *analogRead()*
- *analogReference()*
- *analogWrite()*

En el listado que se muestra a continuación se presenta un ejemplo de utilización de estas funciones para modificar la intensidad de un LED dependiendo del valor fijado en un divisor de tensión.

*Arduino AD*
```
//Ejemplo de manejo de señales analógicas

int ledPin = 9;      // LED connected to digital pin 9
int analogPin = 3;   // potentiometer connected to analog pin 3
int val = 0;         // variable to store the read value

void setup() {
  pinMode(ledPin, OUTPUT);  // sets the pin as output
}

void loop() {
  val = analogRead(analogPin);  // read the input pin
  analogWrite(ledPin, val / 4); // analogRead values go from 0 to 1023, analogWrite values from 0 to 255
}
```

#### 9.2.2 Sensor de luz

Puede construirse un esquema similar sustituyendo el potenciómetro por una fotorresistencia en serie con una resistencia limitadora fija. El divisor de tensión resultante permite medir la cantidad de luz recibida.

#### 9.2.3 Sensor de distancia

Cualquier sensor de distancia que proporcione una salida analógica se puede integrar con facilidad. La salida debe estar dentro del rango de voltajes que admite el conversor analógico/digital del Arduino (0-5v).

#### 9.2.4 Giróscopos, acelerómetros, magnetómetros

En el caso de sensores más sofisticados, es necesario utilizar librerías específicas.

### 9.3 Comunicación entre Arduino y Processing

Pueden encontrarse diversos [tutoriales](https://learn.sparkfun.com/tutorials/connecting-arduino-to-processing/all) que indican cómo establecer una comunicación a través del puerto serial entre Arduino y Processing.

Partiendo del ejemplo de comunicación serial visto anteriormente, el código para recibir el mensaje enviado desde Arduino con Processing sería el que se recoge en el siguiente listado.

*Processing serial R*
```
//Ejemplo de recepción de mensaje por el puerto serial con Processing

import processing.serial.*;

Serial myPort;  // Create object from Serial class
String val;     // Data received from the serial port

void setup()
{
  String portName = Serial.list()[0]; //change the 0 to a 1 or 2 etc. to match your port
  myPort = new Serial(this, portName, 9600);
}

void draw()
{
  if ( myPort.available() > 0)
  {  // If data is available,
    val = myPort.readStringUntil('\n'); // read it and store it in val
  }
  println(val); //print it out in the console
}

```

La comunicación en sentido inverso se puede establecer tal y como se recoge en los ejemplos de escritura desde Processing y lectura desde Arduino que se muestran a continuación.

*Processing Serial W*
```
//Ejemplo de envío de mensaje por el puerto serial con Processing

import processing.serial.*;

Serial myPort;  // Create object from Serial class

void setup()
{
  size(200,200); //make our canvas 200 x 200 pixels big
  String portName = Serial.list()[0]; //change the 0 to a 1 or 2 etc. to match your port
  myPort = new Serial(this, portName, 9600);
}

void draw() {
  if (mousePressed == true)
  {                           //if we clicked in the window
    myPort.write('1');         //send a 1
    println("1");   
  } else
  {                           //otherwise
    myPort.write('0');          //send a 0
  }   
}

```

*Arduino Serial R*
```
//Ejemplo de recepción de mensaje por el puerto serial con Arduino

 char val; // Data received from the serial port
 int ledPin = 13; // Set the pin to digital I/O 13

 void setup() {
   pinMode(ledPin, OUTPUT); // Set pin as OUTPUT
   Serial.begin(9600); // Start serial communication at 9600 bps
 }

 void loop() {
   if (Serial.available())
   { // If data is available to read,
     val = Serial.read(); // read it and store it in val
   }
   if (val == '1')
   { // If 1 was received
     digitalWrite(ledPin, HIGH); // turn the LED on
   } else {
     digitalWrite(ledPin, LOW); // otherwise turn it off
   }
   delay(10); // Wait 10 milliseconds for next reading
}

```

### 9.4 Algunas fuentes y ejemplos

- [Real Time Face Detection and Tracking Robot using Arduino](https://forum.processing.org/two/discussion/23461/real-time-face-detection-and-tracking-robot-using-arduino)
- [Electronics by Hernando Barragán and Casey Reas](https://processing.org/tutorials/electronics/)
- [Arduino and Processing](https://playground.arduino.cc/Interfacing/Processing/)
- [Connecting Arduino to Processing](https://learn.sparkfun.com/tutorials/connecting-arduino-to-processing)



### 9.5 Tarea

Programar una interfaz que utilice la información de distancia suministrada por el sensor infrarrojo Sharp GP2D12 o similar, capturada a través del Arduino, para controlar el movimiento del juego Pong implementado con Processing. Debe ponerse especial cuidado en el conexionado de cada cable del sensor de distancia a las señales que correspondan en la tarjeta: rojo = 5v, negro = GND y amarillo = AI0.

La entrega se debe realizar a través del campus virtual, remitiendo un enlace a un proyecto github, cuyo README sirva de memoria, por lo que se espera que el README:

- identifique al autor,
- describa el trabajo realizado,
- argumente decisiones adoptadas para la solución propuesta,
- incluya referencias y herramientas utilizadas,

***
Bajo licencia de Creative Commons Reconocimiento - No Comercial 4.0 Internacional
