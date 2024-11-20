## Práctica 6. Tecnologías emergentes 

### Contenidos

[Mediapipe](#mediapipe)  
[VLM](#modelos-de-visión-y-lenguaje)  

<!--[360](#imagen-y-v-ideo-360)   -->

<!--Ver algunos ejemplos cvzone https://github.com/cvzone/cvzone https://www.computervision.zone
PyGame para pistas de sonido
PYO (https://pypi.org/project/pyo/) para sonidos, MUSIC21 para pasar a notas https://pypi.org/project/music21/
teachable machines -->

## Mediapipe

[Mediapipe](https://pypi.org/project/mediapipe/) proporciona acceso a diversas soluciones de aprendizaje automático, siendo un proyecto *open source*, y concebido para entorno móvil, web y de limitados recursos.
Te será de utilidad la [documentación](ttps://ai.google.dev/edge/mediapipe/solutions/guide). En cualquier caso, para su instalación he seguido los siguientes pasos:

```
conda create --name=VC_P6 python=3.11.5
conda activate VC_P6
pip install mediapipe
```

En la página de [Mediapipe](https://developers.google.com/mediapipe), además de contar con varios vídeo-tutoriales en la parte inferior, verás en al parte superior el botón [See demos]([Mediapipe](https://mediapipe-studio.webapps.google.com/home) desde el que podrás lanzar varias demos desde el navegador. Para todas ellas se ofrece ejemplo de código para distintas plataformas. 

Para el cuaderno he adaptado dos de ellas: 1) [Face Landmark Detection](https://mediapipe-studio.webapps.google.com/studio/demo/face_landmarker) y 2) [Hand Landmark Detection](https://mediapipe-studio.webapps.google.com/studio/demo/hand_landmarker). En **ambos casos deberás descargar el modelo**:

- El modelo de la malla de la cara lo he descargado desde [esta página](https://developers.google.com/mediapipe/solutions/vision/face_landmarker/index#models), observarás que es muchísimo más denso que los vistos anteriormente. 

- En el caso de la mano, usé este [otro enlace](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker).


Como experiencia personal, la demo web de las manos funciona con ambas, el cuaderno me detecta una sola, y no de forma tan robusta.


Mejor con cvzone

```
pip install cvzone
```

## Modelos de visión y lenguaje

[BLIP-2](https://github.com/salesforce/LAVIS/tree/main/projects/blip2) (Bootstrapped Language-Image Pretraining 2) es un modelo de visión y lenguaje desarrollado por [Salesforce](https://github.com/salesforce), concebido para tareas como generar descripciones de imágenes, responder a preguntas visuales y buscar información en imágenes a través de lenguaje natural.

Como demostradores, les proponemos hacer uso de un modelo de *visual question answering* (VQA), para ello, es necesario instalar
el paquete necesario para usar [LAVIS](https://github.com/salesforce/LAVIS) (A Library for Language-Vision Intelligence) en el *environment* de trabajo:

```
pip install salesforce-lavis
```

Tras la instalación, puedes lanzar un primer demostrador que nos permite preguntar a la imagen, en concreto  *Demo_image_VQAOPT_interactive.py*

```
python Demo_image_VQAOPT_interactive.py
```

Ten presente que se ejecuta en CPU, dado que no hemos instalado pytorch para GPU en el laboratorio. Se carga una imagen por defecto, 
editando el código, tienes libertad para escoger la imagen de entrada. Las preguntas debes introducirlas en la consola en inglés, deteniendo la ejecución al teclear *exit* como pregunta. Observarás que no solo responde a aspectos visibles en la imagen. Algunos ejemplos de preguntas para la imagen ejemplo:

```
What color is the person's shirt?
Do you see the person's legs?
How old is the person?
Where is the person from?
What is the person's name?
```

Se incluye también el desmostrador utilizado usamos en la Jornadas de Puertas Abiertas, que requiere instalar YOLO, y contar con una webcam.

```
pip install ultralytics
```

Para lanzarlo, teclea:

```
python Demo_yolo_VQAOPT_2425.py
```

Ahora sí que se notará la ausencia de GPU presente o habilitada. Pese a ello, se obtienen *al golpito* descripciones de las personas que se acerquen a la cámara.



<!--
## Segmentación

Unet

SAM

DINO+SAM


Background removal https://github.com/chenxwh/cog-RMBG
https://github.com/naver-ai/ZIM



## Homografías

Tomando ejemplo escenario deporte


## YOLO-World

Integrado en el paquete de ultralitycs, permite detectar objetos en una imagen proporcionando una descripción de texto

## Supervision

Pretende ser independiente del modelo. ¿Pide licencia?

https://roboflow.github.io/cheatsheet-supervision/

```
pip install supervision
```

https://pypi.org/project/supervision/

## Imagen y vídeo 360

Mi experiencia con imagen y vídeo 360 se centra en la Gopro MAX.
Para trabajar con material capturado con la Gopro MAX en el PC, tuve que instalar [Gopro Player](https://gopro.com/es/es/info/gopro-player). Realmente con el enlace anterior siempre obtengo como respuesta *"Ha habido un problema"*, por lo que acabé con un enlace a una [beta](https://install.appcenter.ms/orgs/sw-team-devops-rimo/apps/gopro-player-for-windows-beta/distribution_groups/public?fbclid=IwAR2AVN9jQSLJETcmC57ILYKT1_B4JxVPa8MOYhg3mRvdSDQYh2sCVvuZ6VI). No me hago responsable.

Gopro utiliza el códec HEVC, según mis notas tuve que instalar el códec, y aparentemente lo obtuve a través de este [enlace](https://apps.microsoft.com/detail/9MW2BVRCG0B2?rtc=1&hl=es-es&gl=ES), en cualquier caso, he dejado un enlace en el campus.

De cara a verlo en las gafas de RV, conecté con cable USB (puerto USB-3), y aparece como una unidad USB. Si no es conexión USB-3 y no del frontal de la torre, no he conseguido acceder. Tengo dudas si además he tenido que tener instalada la [aplicación de Quest](https://www.meta.com/es/quest/setup/) para el PC. En algún equipo tuve que dar permiso para que se pudiera acceder a las gafas. Una vez que el contenido haya sido copiado en las gafas, he probado en la carpeta *Movies*, lo he visualizado en 360 utilizando la aplicación *Meta Quest TV* como aplicación en las gafas accediendo a *Tu contenido*.
-->
<!--

https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task

[Repositorio de  modelos](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker/index#models)
-->


<!--

Setup
https://www.youtube.com/watch?v=VicWnzy-O5Y

Balance

Cable, Sony Multi


Arrancar

App, calibración
-->


***
Bajo licencia de Creative Commons Reconocimiento - No Comercial 4.0 Internacional
