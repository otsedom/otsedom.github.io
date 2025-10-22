
## Práctica 5. Reconocimiento de caracteres en matrículas

### Contenidos

[Tarea](#51-aspectos-cubiertos)  
[OCRs](#52-ocrs)  
[VLMs](#53-vlms)  
[Entrega](#54-entrega)

<!-- MOdelos VLM para OCR https://florence-2.com  -->


## 5.1 Aspectos cubiertos

En esta práctica se aborda el uso de modelos existentes para el reconocimiento de texto, el objetivo es el de expandir el detector de coches y matrículas de la anterior tarea
para que sea capaz de **reconocer los caracteres en las matrículas visibles** y así ser capaces de identificar el coche correctamente.

En la actualidad suele haber dos vías a la hora de plantear un modelo que realice reconocimiento óptico de caracteres (OCR). La primera sería usar una red neuronal especializada en detectar e identificar el texto en la imagen. Por su parte, la segunda manera correspondería a usar un modelo de lenguaje visual (VLM por sus siglas en inglés) como podrían ser GPT-4o o Gemini 2.5 para extraer directamente la información de la imagen. Estas dos maneras de enfocar el problema representan el clásico balance entre una solución rápida (red neuronal) y una solución con una mayor tasa de acierto pero más costosa computacionalmente (VLM's).

En la práctica de hoy propondremos el uso de al menos dos modelos para hacer algunas comparaciones entre ellos y complementar la anterior práctica con la extracción del texto de las matrículas.

### 5.2 OCRs

Como reconocedores de caracteres basados en redes neuronales clásicas, proponemos tres opciones: Tesseract, easyOCR y PaddleOCR. Para los tres, el cuaderno proporcionado esta semana incluye demostradores mínimos. Otra posibilidad es [KERAS-OCR](https://github.com/faustomorales/keras-ocr), o [dots.ocr](https://github.com/rednote-hilab/dots.ocr), de los que no ilustramos su uso en este cuaderno.
<!-- Al ser un nuevo *environment* no olvidar  que es necesario instalar el paquete para ejecutar cuadernos, desde consola-->

Por un lado, el conocido [Tesseract](https://github.com/tesseract-ocr/tesseract), requiere desde python un *wrapper*, previa instalación.
La documentación de [Tesseract](https://tesseract-ocr.github.io/tessdoc/Installation.html) dispone de **información para su instalación en distintas plataformas**.
Para entorno WIdnows:

- Decargar los binarios desde el repositorio para tal fin de la [Universidad Manheim](https://github.com/UB-Mannheim/tesseract/wiki).
- Ejecutar el archivo descargado para lsu instalación
- Durante la instalación, he indicado que incluya datos de otros lenguajes, en mi caso español
- Anotar la ruta donde se instala, dado que debe especificarse en el código python. O añadir al *PATH*.
- Instalar el *wrapper* [pytesseract](https://pypi.org/project/pytesseract/) ven el *environment* *VC_P4*:

```
pip install pytesseract
```

Por otro lado, [easyOCR](https://github.com/JaidedAI/EasyOCR) ofrece soporte para más de 80 lenguas. Su instalación es a priori más simple, basta con:

```
pip install easyocr
```

Pero surge una **incidencia** con OpenCV, dado que funciones de visualización, como *imshow*, dejan de estar presentes. Observando la incompatibilidad entre la instalación de YOLO y easyOCR,
puedes llegar a un punto en que la instalación de OpenCV no sea completa para nuestro cuaderno. Lo hemos conseguido resolver con:

```
pip uninstall opencv-python opencv-python-headless
pip install opencv-python --upgrade
```

Por último, [PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR) es la solución de OCR propuesta por la empresa china PaddlePaddle y ofrece, al igual que EasyOCR, soporte para más de 80 idiomas, incluyendo el Español. Su instalación consta de dos pasos, primero hay que instalarse la librería de PaddlePaddle usando el comando que se corresponda a nuestra máquina en la [web oficial](https://www.paddlepaddle.org.cn/en/install/quick?docurl=/documentation/docs/en/develop/install/pip/windows-pip_en.html) de forma muy similar a torch. Posteriormente, se instala el OCR usando el comando en la consola:

```
pip install paddleocr
```

### 5.3 VLMs

Como VLM para realizar OCR solamente mostraremos el uso de uno, [SmolVLM](https://huggingface.co/blog/smolvlm), esto se debe principalmente a la alta cantidad de recursos que necesitan estos modelos para ser ejecutados en local, lo cual los hace díficil de usar en un entorno sin GPU. SmolVLM es un VLM introducido en noviembre del 2024 creado especificamente para competir con modelos más grandes sin por ello usar una gran cantidad de memoria. Aunque permita un uso general, en esta práctica lo usaremos únicamente por sus capacidades de OCR.
Para su uso tendremos que instalar dos librerias diferentes: torch, haciendo uso de la [web oficial](https://pytorch.org/get-started/locally/) para obtener el comando que se corresponda a nuestro PC y la librería transformers de [HuggingFace](https://huggingface.co). La librería transformers nos permite descargar y usar fácilmente modelos entrenados por la comunidad en nuestro ordenador. Para su instalación simplemente:

```
pip install transformers
```

Otras posibilidades podrían ser los modelos de la familia [Idefics](https://huggingface.co/blog/idefics2) de la propia HuggingFace, [Florence-2](https://huggingface.co/microsoft/Florence-2-large) de Microsoft o [PaliGemma](https://huggingface.co/blog/paligemma2) de Google.


### 5.4 Entrega

Para la entrega de esta práctica habrá que complementar la tarea de la Práctica 4 para extraer también el número de matrícula de los diferentes vehículos. Además. habrá que hacer una pequeña comparativa entre dos o más de los modelos propuestos en términos de tiempo de inferencia y tasa de acierto con la base de datos que se haya seleccionado para el entrenamiento de la práctica anterior u otra.

La **entrega** se hará junto a la de la anterior práctica, incluyendo en el vídeo de test una visualización de la matrícula leída y en el csv de volcado una columna con la matrícula correspondiente. La comparativa deberá hacerse dentro del propio README, incluyendo gráficas de tiempos y rendimiento, así como unas pequeñas conclusiones.


***
Bajo licencia de Creative Commons Reconocimiento - No Comercial 4.0 Internacional

