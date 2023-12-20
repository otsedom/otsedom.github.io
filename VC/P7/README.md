## Práctica 7. Otros recursos

### Contenidos

[Mediapipe](#mediapipe)  
[360](#imagen-y-v-ideo-360)   

## Mediapipe

[Mediapipe](https://developers.google.com/mediapipe) proporciona acceso a diversas soluciones de aprendizaje automático, siendo un proyecto open source.
Te será de utilidad la [documentación](https://developers.google.com/mediapipe/solutions/guide). En cualquier caso, para su instalación he seguido los siguientes pasos:

```
conda create --name=mediapipe python=3.11.5
conda activate mediapipe
pip install mediapipe
```

En la página de [Mediapipe](https://developers.google.com/mediapipe), además de contar con varios vídeo-tutoriales en la parte inferior, verás en al parte superior el botón [See demos]([Mediapipe](https://mediapipe-studio.webapps.google.com/home) desde el que podrás lanzar varias demos desde el navegador. Para todas ellas se ofrece ejemplo de código para distintas plataformas. Para el cuaderno he adaptado dos de ellas: 1) [Face Landmark Detection](https://mediapipe-studio.webapps.google.com/studio/demo/face_landmarker) y 2) [Hand Landmark Detection](https://mediapipe-studio.webapps.google.com/studio/demo/hand_landmarker). En ambos casos deberás descargar el modelo. El modelo de la malla de la cara lo he descargado desde [esta página](https://developers.google.com/mediapipe/solutions/vision/face_landmarker/index#models), observarás que es muchísimo más denso que los vistos anteriormente. En el caso de la mano, usé este [otro enlace](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker).


Como experiencia personal, la demo de las manos funciona con ambas, el cuaderno me detecta una sola, y no de forma tan robusta.


## Imagen y vídeo 360

Mi experiencia con imagen y vídeo 360 se centra en la Gopro MAX.
Para trabajar con material capturado con la Gopro MAX en el PC, tuve que instalar [Gopro Player](https://gopro.com/es/es/info/gopro-player). Realmente con el enlace anterior siempre obtengo como respuesta *"Ha habido un problema"*, por lo que acabé con un enlace a una [beta](https://install.appcenter.ms/orgs/sw-team-devops-rimo/apps/gopro-player-for-windows-beta/distribution_groups/public?fbclid=IwAR2AVN9jQSLJETcmC57ILYKT1_B4JxVPa8MOYhg3mRvdSDQYh2sCVvuZ6VI). No me hago responsable.

Gopro utiliza el códec HEVC, según mis notas tuve que instalar el códec, y aparentemente lo obtuve a través de este [enlace](https://apps.microsoft.com/detail/9MW2BVRCG0B2?rtc=1&hl=es-es&gl=ES), en cualquier caso, he dejado un enlace en el campus.

De cara a verlo en las gafas de RV, conecté con cable USB (puerto USB-3), y aparece como una unidad USB. Si no es conexión USB-3 y no del frontal de la torre, no he conseguido acceder. Tengo dudas si además he tenido que tener instalada la [aplicación de Quest](https://www.meta.com/es/quest/setup/) para el PC. En algún equipo tuve que dar permiso para que se pudiera acceder a las gafas. Una vez que el contenido haya sido copiado en las gafas, he probado en la carpeta *Movies*, lo he visualizado en 360 utilizando la aplicación *Meta Quest TV* como aplicación en las gafas accediendo a *Tu contenido*.

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
