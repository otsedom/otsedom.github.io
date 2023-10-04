## Práctica 3. Detección de formas

### Contenidos

[Aspectos cubiertos](#31-aspectos-cubiertos)

### 3.1. Aspectos cubiertos

En esta práctica el objetivo es extraer información geométrica de los objetos presentes en una imagen. Para ello, se presentan ejemplos haciendo uso de detección de contornos y cálculo de la transformada de Hough para la detección de formas circulares.

En una primera tarea se asume que todos los objetos de interés en la imagen son circulares, en concreto monedas de la UE. Tras mostrar diversas aproximaciones para obtener sus contornos, el reto o tarea consiste en determinar la cantidad de dinero presente en la imagen.  

Para la segunda tarea, se proporcionan tres subimágenes de tres clases de microplásticos recogidos en playas canarias. La tarea propuesta consiste en determinar patrones en sus características geométricas que puedan permitir su clasificación en dichas imágenes y otras. Como fuente de partida, se proporciona enlace al trabajo [SMACC: A System for Microplastics Automatic Counting and Classification](https://doi.org/10.1109/ACCESS.2020.2970498) en el que se adoptan algunas propiedades geométricas para dicho fin. De forma resumida, las características geométricas utilizadas en dicho trabajo fueron:

- Área en píxeles
- Perímetro en píxeles
- Compacidad (relación del cuadrado del perímetro con el área)
- Relación del área con la del contenedor
- Relación del ancho y el alto del contenedor
- Relación entre los ejes de la elipse ajustada
- Definido el centroide, relación entre las distancias menor y mayor al contorno

Si no te quedaras satisfecho con el umbralizado para separar los objetos del fondo, te animo a explorar técnicas de segmentación recientes y potentes como [Segment anything o SAM](https://segment-anything.com), y proyectos extendidos como [FastSAM](https://github.com/CASIA-IVA-Lab/FastSAM) o [Count anything](https://github.com/ylqi/Count-Anything). No dudes en comentar otras alternativas que descubras.

<!---Momentos en trabajo de Nayar sobre Binary images https://cave.cs.columbia.edu/Statics/monographs/Binary%20Images%20FPCV-1-3.pdf -->


***
Bajo licencia de Creative Commons Reconocimiento - No Comercial 4.0 Internacional
