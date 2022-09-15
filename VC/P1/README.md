## Práctica 1. Primeros pasos con OpenCV

### Contenidos

[Instalación](#11-instalando-el-entorno-de-desarrollo)
[Aspectos cubiertos](#12-aspectos-cubiertos)

### 1.1. Instalando el entorno de desarrollo  

Si bien tienen libertad para seleccionar el entorno de desarrollo, mi opción escogida para mostrar
los distintos ejemplos en el laboratorio con Python ha sido [Anaconda](https://www.anaconda.com)
para crear un *environment* desde el que lanzar cuadernos Jupyter desde [Visual Studio Code](https://code.visualstudio.com).

Los equipos del laboratorio ya cuentan con Anaconda y VS Code instalados. A partir de dicho punto, para poder ejecutar los cuadernos
proporcionados, resumo los pasos que tuve que realizar:


- Lanzar VS Code

- Instalar la extensión de Python en VS Code. Desde el [enlace](https://code.visualstudio.com/docs/languages/python) con VS Code abierto me lleva al
[enlace](https://marketplace.visualstudio.com/items?itemName=ms-python.python) en el *Marketplace*

- Lanzar *Anaconda Prompt*

- Crear el *environment* con la configuración que nos interese. Reproduzco la instalación que está en funcionamiento en mi equipo, con Python 3.7.3, si bien incluye
paquetes no necesarios en las primeras prácticas. Sugiero sustituir *ENV_NAME* por un nombre de su elección.

```
conda create --name ENV_NAME python=3.7.3 --file spec-list.txt
```

El comando anterior puede requerir unos minutos. A continuación se activa *environment*

```
conda activate ENV_NAME
```

Y se instala algún paquete adicional necesario

```
pip install imutils sklearn matplotlib
```

- En este momento debemos tener en ejecución tanto VS Code como la terminal de *Anaconda Prompt*


- En VS Code será necsario lanzar su *Command Palette* con la combinaciçon *CTRL+SHIT+Palette*

- Es el momento de seleccionar el *environment* recientemente creado, tecleando *Python: Seleccionar intérprete*,  seleccionando el que nos interese.

- Una vez llegados a este punto, la primera ejecución de un cuaderno probablemente produzca un error, ya que es necesario instalar elementos necesarios para el
uso de los cuadernos instalando *ipykernel*. En mi caso, VS Code me propuso el siguiente comando


```
conda install -n ENV_NAME ipykernel --update-deps --force-reinstall
```

- Llegado a este punto, ya me fue posible ejecutar el cuaderno de esta primera práctica. Cruzo los dedos, aunque no descarto que en algún momento debas instalar algún paquete perdido.
Si algo hubiera ido mal y quisieras eliminar el *environment* para empezar de nuevo, recordar que el comando sería:

```
conda env remove -n ENV_NAME
```

### 1.2. Aspectos cubiertos

El objetivo de esta práctica es comprender de forma aplicada la representación de imágenes de grises y color, su modificación, visualización y tratamiento básico. Se proponen varias tareas:

- Crear una imagen con la textura de un tablero de ajedrez
- Crear una imagen estilo Mondrian

![Mondrian](https://sites.google.com/site/cuadrospepelo/_/rsrc/1379171406298/composicion-con-amarillo-rojo-azul-y-negro/Cuadro.jpg?height=399&width=400)  
*Piet Mondrian, "Composición con rojo, amarillo y azul" (1930).*

- Hacer uso de las funciones de dibujo de OpenCV
- Modificar un plano de la imagen
- Detectar los píxeles más claro y oscuro de una imagen
- Hacer una propuesta pop art con la entrada de la cámara web o vídeo

La entrega del cuaderno o cuadernos con la resolución de tareas propuestas e imágenes resultantes será individual, a través del campus virtual teniendo como límite el comienzo de la siguiente sesión práctica (22 de septiembre)
