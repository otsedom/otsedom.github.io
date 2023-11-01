## Práctica 5. Reconocimiento de matrículas

### Contenidos

[Tarea](#51-tarea)  
[YOLOv8](#52-yolov8)  
[OCRs](#53-ocrs)  

<!--[YOLOv7](#52-yolov7)  -->


## 5.1 Tarea

En esta práctica describo en primer término la tarea:  **El objetivo es desarrollar un prototipo de sistema que identifique la matrícula de un vehículo, bien desde una imagen o desde un vídeo**.

Nos centraremos en matrículas españolas, siendo una primera subtarea recopilar o capturar imágenes o vídeos que contengan vehículos con su matrícula visible. Si necesitan cámaras, trípode, etc. hablen conmigo.

Si bien cuentan con libertad a la hora de escoger los módulos que integren en el prototipo, les propongo los siguientes apartados un detector de objetos, que permita localizar vehículos, y un reconocedor de texto, para el que deberán definir alguna estrategia de cara a que se focalice en las zonas de probable presencia de la matrícula. En una primera fase, las zonas probables se asumen que corresponden a zonas rectangulares (su contorno lo es), y en una segunda fase, les propongo crear un detector de matrículas basado en YOLOv8.



<!--
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
*environment* para poder usarla con el demostrador. Sin embargo hasta ahora no he tenido fortuna, pese a tener instalado CUDA y considerar haber seguido la documentación de [pytorch](https://pytorch.org/get-started/locally/),
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
-->

## 5.2 yolov8

<!-- environment VC_P1 e portátil -->

Durantes este año 2023, Ultralytics presenta yolov8. Para su instalación en el environment *VC_P1* he seguido los pasos del  [tutorial de instalación de Ultralytics] (https://docs.ultralytics.com/quickstart/#install-ultralytics). No dejes de lado la [documentación](https://docs.ultralytics.com)

```
pip install ultralytics

```

Ha sido muy poco engorroso en mi experiencia. Una vez instalada, puede ejecutarse desde línea decomandos con algo como:


<!-- yolo detect predict model=yolov8n.pt source="C:/Users/otsed/Desktop/RUNNERS_ILUSOS/Multimedia/Bibs/TGC23_PdH_C0056_resultado.mp4"  -->
```
yolo detect predict model=yolov8n.pt source="rutavideo"
```

Con el parámetro model se define el modelo preentrenado a utilizar, los resultados los almacena en una carpeta *runs/detect/predict*. Los distintos parámetros de la ejecución sedescriben en la documentación del modo [*predict*](https://docs.ultralytics.com/modes/predict/). El modelo escogido detecta contenedores, para la segmentación semántica sugerir por ejemplo el modelo *yolov8n-seg.pt*.

<!--A este segundo también le añadí la opción "device" para decirle qué tarjetas tiene que usar.-->

Si nos interesa detectar desde nuestro código, como en *VC_P5_yolov8.ipynb*


https://stackoverflow.com/questions/75714505/how-to-only-detect-person-class-from-yolov8

<!--

El código para entrenar es este:

```

yolo detect train model=yolov8n.pt data=experiment3.yaml imgsz=1920 batch=8 device=0,1,2,3 epochs=100
```


[YOLO-NAS](https://github.com/Deci-AI/super-gradients/blob/master/documentation/source/YoloNASQuickstart.md) para mejorar con objetos pequeños y pocos recursos ...


-->

### 5.3. OCRs

Como reconocedores de caracteres, les propongo dos opciones disponibles.
Para ambos se incluyen demostradores mínimos en el cuaderno proporcionado esta semana.
<!-- Al ser un nuevo *environment* no olvidar  que es necesario instalar el paquete para ejecutar cuadernos, desde consola-->


Por un lado, [Tesseract](https://github.com/tesseract-ocr/tesseract), para el que desde python será necesario un wrapper, además de instalarlo.
La documentación de [Tesseract](https://tesseract-ocr.github.io/tessdoc/Installation.html) dispone de información para su instalación en distintos sistemas operativos
Para entorno Windows, siguiendo las instrucciones de la mencionada documentación, me he descargado los binarios desde el repositorio para tal fin de la [Universidad Manheim](https://github.com/UB-Mannheim/tesseract/wiki). Al instalar he indicado que incluya datos de otros lenguajes, en mi caso español. Además he anotado la carpeta donde se instala.

El *wrapper* es [pytesseract](https://pypi.org/project/pytesseract/) se instala cómodamente en el *environment* creado en el paso anterior con:

```
pip install pytesseract
```


Por otro lado, [easyOCR](https://github.com/JaidedAI/EasyOCR) queofreceun cómodo soporte para más de 80 lenguas, cuya instalacón es aún más simple, basta con:

```
pip install easyocr
```





***


Llegado a este punto:
¡¡A jugarrrr!!



***
Bajo licencia de Creative Commons Reconocimiento - No Comercial 4.0 Internacional
