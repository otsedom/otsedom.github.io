## Práctica 1. Primeros pasos con OpenCV

### Contenidos

[Instalación](#11-instalando-el-entorno-de-desarrollo)  
[Anaconda](#111-comandos-basicos-de-anaconda)  
[Spec-list](#112-un-environment-para-varias-practicas)  
[Mi carpeta](#113-el-environment-en-otra-carpeta)  
[Aspectos cubiertos](#12-aspectos-cubiertos)  

### 1.1. Instalando el entorno de desarrollo  

Si bien tienen libertad para seleccionar el entorno de desarrollo, la opción escogida para mostrar
los distintos ejemplos en el laboratorio con Python desde Windows ha sido [Anaconda](https://www.anaconda.com). Anaconda permite crear distintos *environments*, cada uno con sus paquetes particulares y versiones específicas instaladas, pudiendo desde [Visual Studio Code](https://code.visualstudio.com) ejecutar un cuaderno concreto escogiendo el *environment* que interese. Para las personas que prefieran no utilizar Windows, comentarles que nuestra experiencia en Linux con [Miniconda](https://docs.conda.io/projects/miniconda/en/latest/miniconda-install.html) ha sido similar.

Los equipos del laboratorio ya cuentan con Anaconda y VS Code instalados, si bien no completamente configurados para ejecutar el cuaderno de esta práctica. Conocida esta circunstancia, para poder ejecutar un primer cuaderno proporcionado tras contar en el equipo con la instalación de Anaconda y VS Code, los pasos a realizar son:

- Lanzar VS Code (en el PC del laboratorio disponible en el escritorio)

- Instalar la extensión de Python en VS Code. Desde el [enlace](https://code.visualstudio.com/docs/languages/python) con VS Code abierto debería llevar al [enlace](https://marketplace.visualstudio.com/items?itemName=ms-python.python) en el *Marketplace*

- Lanzar *Anaconda Prompt*

- Crear el *environment* con la configuración que nos interese. Para crear uno que ejecute el cuaderno de esta práctica, sin darle muchas vueltas con una versión reciente de Python, se les propone lo siguiente:

```
conda create --name VC_P1 python=3.11.5
```

Observen que crea  el *environment* *VC_P1* con una versión de Python en particular. Sustituye *VC_P1* por el nombre que decidas. Tras crearlo, y activarlo, instala un par de paquetes adicionales (recuerda sustituir *VC_P1* por el nombre que hayas decidido):

```
conda activate VC_P1
pip install opencv-python
pip install matplotlib
```

NOTA: Para aquellas personas que quieren trabajar bajo Windows, tienen disponible en la sección 1.1.2, la descripción de creación de un *environment* con más paquetes que tendrá vida útil para varias prácticas, si bien con una versión previa de Python. No es estrictamente necesario, y puede dar algún quebradero de cabeza.

Una vez que ya está el *environment* creado:

- Tener en ejecución tanto VS Code como la terminal de *Anaconda Prompt*

- Abrir el cuaderno de la práctica en VS Code

- Desde VS Code, se hace necesario lanzar su *Command Palette* con la combinación *CTRL+SHIT+Palette*

- Es el momento de seleccionar el *environment* recientemente creado, tecleando *Python: Seleccionar intérprete*, escogiendo el que nos interese.

- En algunas máquinas al intentar el comando anterior, ha aparecido un error con algo como *interpreter not found*. Se ha resuelto seleccionando en la parte inferior izquierda el modo *Trust* en lugar de *Restricted*.

- Una vez llegados a este punto, la primera ejecución de un cuaderno probablemente produzca un error, ya que es necesario instalar *ipykernel* con elementos para el uso de los cuadernos. Si no funciona de forma automática, VS Code dará error y sugerirá lanzar desde línea de comando (en ocasiones hemos tenido que lanzarlo desde el environment *base*):

```
conda install -n ENV_NAME ipykernel --update-deps --force-reinstall
```



- Llegados a este punto, ya fue posible ejecutar el cuaderno de esta primera práctica. Cruzo los dedos, y veremos las variantes con las que se encuentran ustedes.

#### 1.1.1. Comandos básicos de Anaconda

En el proceso de creación del *environment* pueden surgir errores, quizás necesitemos eliminarlo, crearlo de  nuevo, listar los existentes. Un muy breve resumen de comandos frecuentes:

```
conda info --envs # Lista environments existentes
conda remove --name ENV_NAME --all # Elimina el environment ENV_NAME
conda list --explicit > spec-file.txt   # genera un txt con los elementos presentes en el environment activado
```



#### 1.1.2. Un environment para varias prácticas

En ocasiones puede ser necesario clonar un *environment* en otro equipo. Una posibilidad es exportando la lista de requisitos, y proceder a su instalación en el otro equipo. Reproduzco la instalación que está en funcionamiento en mi equipo portátil en su partición bajo Windows (no funcionará con otros sistemas operativos). Hace uso de la versión Python 3.7.3, e incluye
paquetes no necesarios en las primeras prácticas. En el caso de querer adoptarla, sugiero sustituir *ENV_NAME* por un nombre de tu elección. En el caso de trabajar en otro sistema operativo, evitar incluir *spec-list.txt* e ir añadiendo los paquetes que vayan siendo necesarios.

```
conda create --name ENV_NAME python=3.7.3 --file spec-list.txt
```

El comando anterior puede requerir unos minutos. A continuación se activa el *environment*

```
conda activate ENV_NAME
```

Y se instala algún paquete adicional necesario

```
pip install imutils scikit-learn matplotlib
```


#### 1.1.3. El environment en otra carpeta


Tener presente que en el laboratorio, si trabajas con el ordenador del aula, el rearranque borra directorios locales, por lo que los *environments* creados localmente, desaparecen. Puede interesar por ello crearlo en una carpeta local que no se limpie, como */pub/tmp*, en un disco externo o *pen* propio con *--prefix flag*.
Para crear el *environment* de la subsección previa en una carpeta concreta en el PC, he procedido con los siguientes comandos:

```
conda create --prefix c:/pub/tmp/JPA/FACES --file spec-list.txt python=3.7.3
conda activate c:/pub/tmp/JPA/FACES
pip install imutils scikit-learn matplotlib
```


Si algo hubiera ido mal y quisieras eliminar el *environment* para empezar de nuevo, recordar los comandos del apartado 1.1.1


### 1.2. Aspectos cubiertos y entrega

El objetivo de esta práctica en primer término es poder ejecutar el cuaderno proporcionado en nuestro propio equipo o el del laboratorio. Este primer cuaderno (*VC_P1.ipynb*) debe servir para comprender de forma aplicada la representación de imágenes de grises y color, su modificación, visualización y tratamiento básico. Al finalizar la práctica, debes ser capaz de crear una imagen de un determinado tamaño,
acceder a los valores asociados a un determinado píxel, modificar dichos valores, dibujar primitivas gráficas básicas sobre una imagen, abrir una imagen de disco, así como acceder a los fotogramas de un vídeo o captura de cámara. Para todo ello, se proponen varias tareas (espero no dejarme ninguna atrás aquí):

- Crear una imagen con la textura de un tablero de ajedrez
- Crear una imagen estilo Mondrian como por ejemplo la mostrada a continuación:

![Mondrian](https://images.squarespace-cdn.com/content/v1/5f638d3adfa9c677cced1579/1602089211975-ONZ6AALHOOPRVT7Z5ALL/Composición+en+rojo%2C+amarillo+y+azul.jpg?format=2500w)  
*Piet Mondrian, "Composición con rojo, amarillo y azul" (1930).*

- Hacer uso de las funciones de dibujo de OpenCV
- Modificar un plano de la imagen
- Destacar tanto el píxel con el color más claro como con el color más oscuro de una imagen
- Hacer una propuesta pop art con la entrada de la cámara web o vídeo

La **entrega del cuaderno o cuadernos** con la resolución de tareas propuestas e imágenes resultantes se realizará por grupos a través del campus virtual por medio de un **enlace github**, teniendo como límite el comienzo de la siguiente sesión práctica de cada grupo. Dichos cuadernos no deben contener celdas que no sean de interés para la resolución de las tareas. Durante la siguiente sesión práctica cada grupo, en orden aleatorio, presentará y defenderá el resultado al profesor responsable de la práctica. De forma genérica, para todas las prácticas, el repositorio github debe incluir un **archivo README** describiendo el trabajo realizado, identificando la **autoría**, además de incluir **referencia a todas las fuentes que hayan sido utilizadas** de alguna forma en el desarrollo de la práctica, e indicar si la ejecución del cuaderno requiere alguna instalación adicional. Será adecuado que el o los cuadernos estén también comentados indicando el propósito de las distintas celdas presentadas como resolución de la tarea o tareas solicitadas.




***
Bajo licencia de Creative Commons Reconocimiento - No Comercial 4.0 Internacional
