
## Morphing

## Física

## Esqueletos

Skeletal

EXternal models



Scenegraph y animaciones
https://r105.threejsfundamentals.org/threejs/lessons/threejs-scenegraph.html

Documentacióin oficial

Animation system https://threejs.org/docs/index.html#manual/en/introduction/Animation-system

CCDIKSolver
MMDAnimationHelper
MMDPhysics
https://threejs.org/examples/#webgl_loader_mmd

## Efectos

https://github.com/mrdoob/three.js/blob/master/examples/webgl_effects_ascii.html

Fog

scene.fog=new THREE.Fog( 0xffffff, 0.015, 100 );
Here we are defining a white fog (0xffffff). The last two properties can be used to
tune how the mist will appear. The 0.015 value sets the near property and the 100
value sets the far property. With these properties you can determine where the mist
will start and how fast it will get denser. There is also a different way to set the mist
for the scene; for this you will have to use the following definition:
scene.fog=new THREE.FogExp2( 0xffffff, 0.015 );



## Propiedades geomatrías

NO VA CON BUFFERGEOMETRY

YUa no existen como propiedades geometry.faces o geometry.vertex ya no existen en BufferGeometry

mesh.geometry.attributes.position.array


https://dustinpfister.github.io/2021/06/07/threejs-buffer-geometry-attributes-position/

Color de las cáras, no me va en release actual

var geometry = new THREE.BoxGeometry(3, 3, 3, 1, 1, 1);
/*Right of spawn face*/
geometry.faces[0].color = new THREE.Color(0xd9d9d9);
geometry.faces[1].color = new THREE.Color(0xd9d9d9);
/*Left of spawn face*/
geometry.faces[2].color = new THREE.Color(0x2196f3);
geometry.faces[3].color = new THREE.Color(0x2196f3);



Object picking y shadermaterial (uso de GPU)

## Ver nubbes de puntos

demo https://pointcloud.ucsd.edu/OH3D/Bagan_Earthquake_Dual.html






#Ray tracing

https://codesandbox.io/examples/package/ray-tracing-renderer

https://discourse.threejs.org/t/three-gpu-pathtracer-a-modular-shader-based-path-tracing-extension-for-three-js/36903


## Arte

SD https://twitter.com/DotCSV/status/1585313640676139010?s=20&t=P8t7_fXiV0fGOL3D-dRP1A

https://huggingface.co/spaces/runwayml/stable-diffusion-inpainting