## Práctica 1. Primeros pasos con OpenCV

### Contenidos

[Instalación](#11-instalando-el-entorno-de-desarrollo)  
[Anaconda](#111-comandos-basicos-de-anaconda)
[Spec-list](#112-un-environment-para-varias-practicas)
[MiCarpeta](#113-el-environment-en-otra-carpeta)
[Aspectos cubiertos](#12-aspectos-cubiertos)

### 1.1. Instalando el entorno de desarrollo  

Si bien tienen libertad para seleccionar el entorno de desarrollo, mi opción escogida para mostrar
los distintos ejemplos en el laboratorio con Python desde Windows ha sido [Anaconda](https://www.anaconda.com)
para crear un *environment* desde el que lanzar cuadernos Jupyter desde [Visual Studio Code](https://code.visualstudio.com). Para las personas que prefieran no utilizar Windows, comentarles que mi experiencia en  en Linux con Miniconda ha sido similar.

Los equipos del laboratorio ya cuentan con Anaconda y VS Code instalados. A partir de dicho punto, para poder ejecutar un primer cuaderno proporcionados, resumo los pasos que tuve que realizar:

- Lanzar VS Code

- Instalar la extensión de Python en VS Code. Desde el [enlace](https://code.visualstudio.com/docs/languages/python) con VS Code abierto me lleva al
[enlace](https://marketplace.visualstudio.com/items?itemName=ms-python.python) en el *Marketplace*

- Lanzar *Anaconda Prompt*

- Crear el *environment* con la configuración que nos interese. Para crear uno sin darle muchas vueltas con una versión reciente de Python, este mes de septiembre he lanzado lo siguiente:

```
conda create --name VC_P1 python=3.11.5
```

Me lo crea con la versión de Python escogida

```
conda activate VC_P1
pip install opencv-python
pip install matplotlib
```

Al ejecutar desde VS Code, tras elegir el kernel concreto, instalará la primera vez el paquete ipykernel para poder ejecutar cuadernos. Si falla, prueba desde Anaconda Prompt (no desde el environment VC_P1 sino el base)

```
conda install -n VC_P1 ipykernel --update-deps --force-reinstall
```

NOTA: Para aquellas personas que quieren trabajar bajo Windows, tienen disponible en la sección 1.1.1, la descripción de creación de un *environment* con más paquetes que tendrá vida útil para varias prácticas.

Tras tener el *environment* creado proseguimos

- En este momento debemos tener en ejecución tanto VS Code como la terminal de *Anaconda Prompt*

- En VS Code será necesario lanzar su *Command Palette* con la combinación *CTRL+SHIT+Palette*

- Es el momento de seleccionar el *environment* recientemente creado, tecleando *Python: Seleccionar intérprete*,  seleccionando el que nos interese.

- Una vez llegados a este punto, la primera ejecución de un cuaderno probablemente produzca un error, ya que es necesario instalar elementos necesarios para el uso de los cuadernos instalando *ipykernel*. En mi caso, VS Code ha dado error, y me propuso el siguiente comando desde línea de comando. Mi experiencia desde *Anaconda Prompt* ha sido positiva al lanzarlo desde el *environment* base, es decir, tras desactivarlo.

```
conda install -n ENV_NAME ipykernel --update-deps --force-reinstall
```

- Llegado a este punto, ya me fue posible ejecutar el cuaderno de esta primera práctica. Cruzo los dedos, aunque no descarto que en algún momento debas instalar algún paquete perdido.

#### 1.1.1. Comandos básicos de Anaconda

En el proceso de creación del *environment* pueden surgir errores, quizás necesitemos eliminarlo, crearlo de  nuevo, listar los existentes. Un muy breve resumen de comandos frecuentes:

```
conda info --envs # Lista environments existentes
conda remove --name ENV_NAME --all # Elimina el environment ENV_NAME
conda list --explicit > spec-file.txt   # genera un txt con los elementos presentes en el envopronmente activado
```



#### 1.1.2. Un environment para varias prácticas

Reproduzco la instalación que está en funcionamiento en mi equipo, bajo Windows (no funcionará con otros sistemas operativos), con Python 3.7.3, si bien incluye
paquetes no necesarios en las primeras prácticas. Sugiero sustituir *ENV_NAME* por un nombre de su elección. En el caso de trabajar en otro sistema operativo, evitar incluir *spec-list.txt* e ir añadiendo los paquetes que vayan siendo necesarios.

```
conda create --name ENV_NAME python=3.7.3 --file spec-list.txt
```


El comando anterior puede requerir unos minutos. A continuación se activa *environment*

```
conda activate ENV_NAME
```

Tener presente que en el laboratorio, la creación de un *environment* se elimina tras un rearranque, por lo que puede interesar crearlo en una carpeta en un disco o pen propio con --prefix flag

```
conda create --name D:\ENVS\ENV_NAME python=3.7.3 --file spec-list.txt

conda activate D:\ENVS\ENV_NAME
```


Y se instala algún paquete adicional necesario

```
pip install imutils sklearn matplotlib
```


#### 1.1.3. El environment en otra carpeta

Si trabajas con el ordenador del aula, el rearranque borra directorios locales. Por ese motivo puede interesarte crear el *environment* en una carpeta a tu elección, por ejemplo un disco externo. Para crear el *environment* de la subsección previa en una carpeta concrete en el PC, he procedido con los siguientes comandos:


```
conda create --prefix c:/pub/tmp/JPA/FACES --file spec-list.txt python=3.7.3
conda activate c:/pub/tmp/JPA/FACES
pip install imutils
pip install scikit-learn
```



Si algo hubiera ido mal y quisieras eliminar el *environment* para empezar de nuevo, recordar que el comando sería:

```
conda env remove -n ENV_NAME
```


### 1.2. Aspectos cubiertos y entrega

El objetivo de esta práctica en primer término es poder ejecutar el cuaderno proporcionado en nuestro propio equipo o el del laboratorio. Este primer cuaderno (VC_P1.ipynb) debe servir para comprender de forma aplicada la representación de imágenes de grises y color, su modificación, visualización y tratamiento básico. Al finalizar la práctica, debes ser capaz de crear una imagen de un determinado tamaño,
acceder a los valores asociados a un determinado píxel, modificar dichos valores, dibujar primitivas gráficas básicas sobre una imagen, abrir una imagen de disco, así como acceder a los fotogramas de un vídeo o captura de cámara. Para todo ello, se proponen varias tareas:

- Crear una imagen con la textura de un tablero de ajedrez
- Crear una imagen estilo Mondrian como por ejemplo

![Mondrian](https://images.squarespace-cdn.com/content/v1/5f638d3adfa9c677cced1579/1602089211975-ONZ6AALHOOPRVT7Z5ALL/Composición+en+rojo%2C+amarillo+y+azul.jpg?format=2500w)  
*Piet Mondrian, "Composición con rojo, amarillo y azul" (1930).*

- Hacer uso de las funciones de dibujo de OpenCV
- Modificar un plano de la imagen
- Destacar tanto el píxel con el color más claro como con el color más oscuro de una imagen
- Hacer una propuesta pop art con la entrada de la cámara web o vídeo

La entrega del cuaderno o cuadernos con la resolución de tareas propuestas e imágenes resultantes se realizará por grupos a través del campus virtual por medio de un enlace github preferentemente, teniendo como límite el comienzo de la siguiente sesión práctica. Durante la siguiente sesión práctica se mostrará, en orden aleatorio, el resultado al profesor de la asignatura.




***
Bajo licencia de Creative Commons Reconocimiento - No Comercial 4.0 Internacional
