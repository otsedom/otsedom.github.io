#Environment lavis (https://github.com/huggingface/blog/blob/main/blip-2.md), requiere también instalar pip install ultralytics
# Pasos instalación en Windows
# conda create -n lavis python=3.8
# conda activate lavis
# pip install salesforce-lavis
# pip install ultralytics
# python Demo...
# Suele quejarse de no localizar lap, en algunos equipo lo instala con AutoUpdate, en otros he tenido que hacer
# pip install lap
# En otros equipo no ha funcionado hasta añadir MSVC con el Visual Installer dentro de las herramientas C++
import cv2
import torch
import os
from PIL import Image
from lavis.models import load_model_and_preprocess
from PIL import Image,ImageDraw, ImageFont

#Por un error que aparecía https://github.com/explosion/spaCy/issues/7664
os.environ['KMP_DUPLICATE_LIB_OK']='True'

# setup device to use
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


#VQA
#Modelo OPT
model, vis_processors, txt_processors = load_model_and_preprocess(name="blip_vqa", model_type="vqav2", is_eval=True, device=device)
#Modelo FLANT5XL, descarga modelos y he necesitado una 3080 paar ejecutar
#model, vis_processors, txt_processors = load_model_and_preprocess(name="blip2_t5", model_type="pretrain_flant5xl", is_eval=True, device=device)

Keepasking = True

#Imagen a cargar
#img = cv2.imread("images/Opel-Astra.png")
img = cv2.imread("images/FERsv3.png")

#Convierte a RGB
converted = cv2.cvtColor(img,cv2.COLOR_BGR2RGB)
raw_image = Image.fromarray(converted)
cv2.imshow('Imagen', img)
cv2.waitKey(50)

print('PREGUNTA')
while Keepasking:

    print('> Introduce una pregunta en inglés (exit para terminar)>')
    question = str(input())

    if question != 'exit':                                        
        #Adapta la pregunta al formato esperado
        image = vis_processors["eval"](raw_image).unsqueeze(0).to(device)                                                
        question = txt_processors["eval"](question)
        #Lanza pregunta al modelo           
        res = model.predict_answers(samples={"image": image, "text_input": question}, inference_method="generate")
        print(res[0])
    else:
        Keepasking = False
  





            
                

                









