## Práctica 5. Reconocimiento de matrículas

### Contenidos

[Tarea](#51-tarea)  
[YOLOv7](#52-yolov7)  
[Tesseract](#53-tesseract)  


## 5.1 Tarea

En esta práctica describo en primer término la tarea:  **El objetivo es desarrollar un prototipo de sistema que identifique la matrícula
de un vehículo, bien desde una imagen o desde un vídeo**.

Nos centraremos en matrículas españolas, siendo una primera subtarea recopilar o capturar imágenes o vídeos que contengan vehículos con su matrícula visible. Si necesitan cámaras, trípode, etc. hablen conmigo.

Si bien cuentan con libertad a la hora de escoger los módulos que integren en el prototipo, les propongo an los siguientes apartados un detector de objetos, que permita localizar vehículos, y un reconocedor de texto, para el que deberán definir alguna estrategia de cara a que se focalice en las zonas de probable presencia de la matrícula.




## 5.2 YOLOv7

La familia de detectores de YOLO cuenta con mucho tirón en años recientes dada su velicidad y calidad de detección. En esta línea la reciente propuesta de
[YOLOv7](https://github.com/WongKinYiu/yolov7) declara [batir los registros](https://amalaj7.medium.com/yolov7-now-outperforms-all-known-object-detectors-fd7170e8542d) de versiones previas.

En los dos enlaces previos se incluyen instrucciones de instalación. En mi experiencia para su instalación en Windows, en primer lugar me he colocado en la carpeta en la que quiero descargar y tecleado los siguientes comandos:

```
git clone https://github.com/WongKinYiu/yolov7.git
cd yolov7
conda create -n yolov7 python=3.9 -y   
conda activate yolov7
pip install -r requirements.txt
```

Una vez finalizados, no he tenido problemas en ejecutar procesando con la CPU. Les muestro un resumen
de llamadas al demostrados *detect.py* procesando una carpeta de imágenes, un vídeo o directamente desde la cámara web:

```
#Inferencia
python detect.py --weights yolov7.pt --conf 0.25 --img-size 640 --source rutaalacarpetaconimágenes\ --view-img --device cpu

#De vídeo almacenado
python detect.py --weights yolov7.pt --conf 0.25 --img-size 640 --source inference/bird.mp4 --view-img --device cpu

#webcam
python detect.py --weights yolov7.pt --conf 0.25 --img-size 640 --source 0 --device cpu

#webcam GPU
python detect.py --weights yolov7.pt --conf 0.25 --img-size 640 --source 0 --device 0
```

Creo que apreciarán que no va muy lento. Como en el PC del despacho tengo una GPU, he intentado configurar el
*envorinment* para poder usarla con el demostrador. Sin embargo hasta ahora no he tenido fortuna, pese a tener instalado CUDA y considerar haber seguido la documentación de [pytorch](https://pytorch.org/get-started/locally/),
para instalar la combinación de
CUDA, pytorch, torchvision y cudatoolkit con el supuesto comando:

```
conda install pytorch==1.12.1 torchvision==0.13.1 cudatoolkit=11.4 -c pytorch
```

Pese a ello, CUDA sigue mostrándose no disponible. Lo he comprobado al teclear

```
import torch
print(torch.cuda.is_available())
```

Me sigue devolviendo *false*. En cualquier caso, me va con CPU con aceptable tasa de fotogramas por segundo con la webcam, por lo que parece viable u uso aún sin GPU. Ustedes aportarán más visiones y experiencias.


### 5.3. Tesseract

Por otro lado les propongo hacer uso de un reconocedor de caracteres existente. Sugerir el uso de [Tesseract](https://github.com/tesseract-ocr/tesseract). Desde python será necesario un wrapper, además de instalarlo.
La documentación de [Tesseract](https://tesseract-ocr.github.io/tessdoc/Installation.html) dispone de información para su instalación en distintos sistemas operativos
Para entorno Windows, siguiendo las instrucciones de la mencionada documentación,  me he descargado los binarios desde el repositorio para tal fin de la [Universidad Manheim](https://github.com/UB-Mannheim/tesseract/wiki). Al instalar he indicado que incluya datos de otros lenguajes, en mi caso español. Además he anotado la carpeta donde se instala.

El *wrapper* es [pytesseract](https://pypi.org/project/pytesseract/) se instala cómodamente en el *environment* creado en el paso anterior con:

```
pip install pytesseract
```


Un demostrador mínimo con Tesseract se incluye en el cuaderno proporcionado esta semana. Al ser un nuevo *envoronment* no olvidar  que es necesario instalar el paquete para ejecutar cuadernos, desde consola

```
pip install ipykernel
```

O directamente desde VS Code.


Llegado a este punto:
¡¡A jugarrrr!!







***
Bajo licencia de Creative Commons Reconocimiento - No Comercial 4.0 Internacional
