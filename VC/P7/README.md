## Práctica 7. Entrenando un detector

### Contenidos

[Anotación de imágenes](#anotación-de-imágenes)  
[Entrenamiento](#entrenamiento)  
[Tarea](#71-tarea)

## Introducción

En la quinta práctica se introducía el uso deYOLOv7 como detector, esta práctica aborda el entrenamiento personalizado para detectar objetos de nuestro interés.

## Anotación de imágenes

Son dos los elementos necesarios, por un lado obtener imágenes con muestras del objeto de interés, y por otro lado, herramientas de anotación para posteriormente proporcionarlas en el entrenamiento.

La recopilación de imágenes puede realizarse de distintas maneras

- accediendo a algún conjunto de datos ya existente
- creando el conjunto de datos

En el segundo caso será necesario recopilar imágenes, pudiendo ser de forma manual, o utilizando utilidades que permitan descargar imágenes realizando búsquedas. Un ejemplo de utilidad, es la proporcionada por [google_images_download](https://pypi.org/project/google_images_download/) que facilita la descarga de un número de imágenes obtenidas realizando búsquedas a través de google.

Tras esta recopilación será necesario en primer término limpiar y filtrar las imágenes , para posteriormente anotar las muestras de nuestro objeto de interés. Asumo una anotación en base a contenedores rectangulares, si bien las herramientas de anotación permiten más variantes.

Si bien existen numerosas herramientas de anotación, las más frecuentes en el grupo han sido:

- [VoTT (Visual Object Tagging Tool)](https://github.com/microsoft/VoTT)
- [labelme](https://github.com/wkentaro/labelme)


La primera de ellas ya no está mantenida. La segunda puede instalarse a través de anaconda, permitiendo distintos tipos de anotación. Para nuestro propósito optaremos por un esquema rectangular. Tras almacenar las anotaciones puede ser necesaria alguna adaptación dependiendo de la red que se use para entrenar.

```
conda create --name=labelme python=3.9
conda activate labelme
pip install labelme
```

Tras esto, desde *Anaconda Prompt* puedes teclear *labelme*, una vez abierta la interfaz, seleccionar la carpeta con imágenes, y en nuestro caso *Edit->Create Rectangle*. Gewnera un *json* para cada imagen. Sugerir en cualquier caso echar un vistazo a la [documentación sobre el uso](https://github.com/wkentaro/labelme#usage).

No es obligatorio utilizar esta herramienta en concreto, hay numerosas y podrás encontrar comparativas.
Existen también numerosos servicios en la nube, como por ejemplo [Roboflow](https://app.roboflow.com/login) que requieren crearse una cuenta para acceder a las utilidades, o [TigTag](https://www.tictag.io) que permite anotar desde el móvil. Te invito a explorar y escoger la herramienta que más te atraiga para el proceso de anotación.

Lo importante es que sea cómoda y fácil de usar, y se agradece que permita exportar a varios formatos, incluyendo YOLO, que es el que usaremos en sucesivas semanas.

<!---Momentos en trabajo de Nayar sobre Binary images https://cave.cs.columbia.edu/Statics/monographs/Binary%20Images%20FPCV-1-3.pdf -->




<!-- Guías CVAT
https://www.simonwenkel.com/lists/software/list-of-annotation-tools-for-machine-learning-research.html
https://www.v7labs.com/blog/cvat-guide
-->


<!--
## Entrenamiento

Buscar
training yolov7 on custom dataset

En esta línea la reciente propuesta de
[YOLOv7](https://github.com/WongKinYiu/yolov7) declara [batir los registros](https://amalaj7.medium.com/yolov7-now-outperforms-all-known-object-detectors-fd7170e8542d) de versiones previas.

En los dos enlaces previos se incluyen instrucciones de instalación. En mi experiencia para su instalación en Windows, en primer lugar me he colocado en la carpeta en la que quiero descargar y tecleado los siguientes comandos:

```
git clone https://github.com/WongKinYiu/yolov7.git
cd yolov7
conda create -n yolov7 python=3.9 -y   
conda activate yolov7
pip install -r requirements.txt
```

Ver Illinois DL4CV hay sobre training

train yolo on custom dataset

https://blog.paperspace.com/yolov7/

Detectando matrículas con yolo
https://towardsdatascience.com/how-to-detect-license-plates-with-python-and-yolo-8842aa6d25f7

//Reconocer matrículs con tesseract

oficial https://pypi.org/project/pytesseract/
https://yashlahoti.medium.com/number-plate-recognition-in-python-using-tesseract-ocr-cc15853aca36
https://www.section.io/engineering-education/license-plate-detection-and-recognition-using-opencv-and-pytesseract/

y localización https://builtin.com/data-science/python-ocr

pip install pytesseract


Recursos OCR https://github.com/kba/awesome-ocr



yolov7 custom dataset
https://youtu.be/-QWxJ0j9EY8

https://youtu.be/a9RJV5gI2VA

## Tarea


-->

***
Bajo licencia de Creative Commons Reconocimiento - No Comercial 4.0 Internacional
