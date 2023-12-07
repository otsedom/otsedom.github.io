## Práctica 7. Otros recursos

### Contenidos

[Mediapipe](#mediapipe)  

## Mediapipe

[Mediapipe](https://developers.google.com/mediapipe) proporciona acceso a diversas soluciones de aprendizaje automático, siendo un proyecto open source.
Te será de utilidad la [documentación](https://developers.google.com/mediapipe/solutions/guide). En cualquier caso, para su instalación he seguido los siguientes pasos:

```
conda create --name=mediapipe python=3.11.5
conda activate mediapipe
pip install mediapipe
```

En la página de [Mediapipe](https://developers.google.com/mediapipe), además de contar con varios vídeo-tutoriales en la parte inferior, verás en al parte superior el botón [See demos]([Mediapipe](https://mediapipe-studio.webapps.google.com/home) desde el que podrás lanzar varias demos desde el navegador. Para todas ellas se ofrece ejemplo de código para distintas plataformas. Para el cuaderno he adaptado dos de ellas: 1) [Face Landmark Detection](https://mediapipe-studio.webapps.google.com/studio/demo/face_landmarker) y 2) [Hand Landmark Detection](https://mediapipe-studio.webapps.google.com/studio/demo/hand_landmarker). En ambos casos deberás descargar el modelo. El modelo de la malla de la cara lo he descargado desde [esta página](https://developers.google.com/mediapipe/solutions/vision/face_landmarker/index#models), observarás que es muchísimo más denso que los vistos anteriormente. En el caso de la mano, usé este [otro enlace](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker).


Como experiencia personal, la demo de las manos funciona con amas, el cuaderno me detecta una sola, y no de forma tan robusta.

<!--

https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task

[Repositorio de  modelos](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker/index#models)
-->





***
Bajo licencia de Creative Commons Reconocimiento - No Comercial 4.0 Internacional
