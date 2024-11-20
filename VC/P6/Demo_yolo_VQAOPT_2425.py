#Environment lavis (https://github.com/huggingface/blog/blob/main/blip-2.md), requiere también instalar pip install ultralytics
# Pasos instalación WINDOWS
# conda create -n lavis python=3.8
# conda activate lavis
# pip install salesforce-lavis
# pip install ultralytics
# python Demo...
# En equipos Windows en ocasiones no ha funcionado hasta añadir MSVC con el Visual Installer dentro de las herramientas C++
# EXTRAS en UBUNTU
# pip uninstall opencv-python
# pip install opencv-python==3.4.10.35
# Suele quejarse de no localizar lap, en algunos equipo lo instala con AutoUpdate, en otros he tenido que hacer
# pip install lap

import cv2
import torch
import os
from PIL import Image
#from lavis.models import model_zoo
from lavis.models import load_model_and_preprocess
import random
from ultralytics import YOLO
import math
import threading
from PIL import Image,ImageDraw, ImageFont
import numpy as np
import pandas as pd
import time
import ctypes
import tkinter as tk

# remove warnings
import warnings
warnings.filterwarnings("ignore")

#Dada una lista, obtiene la cadena más repetida
def cadena_mas_repetida(array):
    conteo = {}

    for cadena in array:
        if cadena in conteo:
            conteo[cadena] += 1
        else:
            conteo[cadena] = 1

    # Encuentra la cadena con el recuento máximo
    cadena_max_repetida = max(conteo, key=conteo.get)
    repeticiones_maximas = conteo[cadena_max_repetida]

    return cadena_max_repetida, repeticiones_maximas

def calculate_iou(box1, box2):
    # Calculate the intersection coordinates
    x1 = max(box1[0], box2[0])
    y1 = max(box1[1], box2[1])
    x2 = min(box1[2], box2[2])
    y2 = min(box1[3], box2[3])
    
    # Calculate the area of intersection rectangle
    intersection_area = max(0, x2 - x1 + 1) * max(0, y2 - y1 + 1)
    
    # Calculate the area of both bounding boxes
    box1_area = (box1[2] - box1[0] + 1) * (box1[3] - box1[1] + 1)
    box2_area = (box2[2] - box2[0] + 1) * (box2[3] - box2[1] + 1)
    
    # Calculate the union area
    union_area = box1_area + box2_area - intersection_area
    
    # Calculate the IOU (Intersection over Union)
    iou = intersection_area / union_area
    
    return iou

# Calculate the area (size) of each bounding box
def calculate_area(box):
    x1, y1, x2, y2 = box
    return (x2 - x1) * (y2 - y1)

def VQA_Process(img,x1,y1,x2,y2,id,idxframe):
    global VQA_available
    global vqa_answers
    global currentquestion
    global ids_data
    global ids_df
    global session_vqa_logs_df
    global sessiontime
    global savelogs
    global nmaxids
    global lastquestionanswered,currentquestionposed,nmaxquestions2show

    #El bucle de datos temporal es finito, el trackid lo puede superar
    idoff = (id-1)%nmaxids

    precondition = False
    #Chequea si la pregunta cumple las restricciones de altura mínima de la pregunta en relación a la imagen
    if (y2-y1)/hf > height_threshold[currentquestion[idoff]]:    
        #Si hay precondición para la pregunta actual, chequea que se cumple, o no la hace
        if precondition_question[currentquestion[idoff]] != -1: #Si es pregunta con precondición
            if len(vqa_answers[idoff][precondition_question[currentquestion[idoff]]]) > 0: #Hay respuestas de las pregunta previa requerida
                resC = cadena_mas_repetida(vqa_answers[idoff][precondition_question[currentquestion[idoff]]])
                #Chequea si se cunmple la precondición
                if resC[0] in precondition_value[currentquestion[idoff]]:
                    precondition = True
        else: #Si no es una pregunta con precondición, simplemente asumimos que la precondición se cumple :)
            precondition = True

    #No hay objeción para lanzar la pregunta
    if precondition:
        #Preguntas que se siguen lanzando hasta que se de una condición que permite averiguar otras cosas, por ejemplo para saber si hay manga corta o larga, deben verse los brazos
        repeatuntilquestion = False
        if (len(vqa_answers[idoff][currentquestion[idoff]]) > 0):
            if keepasking[currentquestion[idoff]] == 10 and vqa_answers[idoff][currentquestion[idoff]][0] not in keepasking_condition[currentquestion[idoff]] :
                repeatuntilquestion = True
        #Descriptor que puede cambiar, tiene activo que se siga preguntando, o no se ha llegado al máximo de preguntas del descriptor
        if keepasking[currentquestion[idoff]] == 1  or len(vqa_answers[idoff][currentquestion[idoff]]) < nmaxdescriptors[currentquestion[idoff]] or repeatuntilquestion:
            #Bloquea para no saturar con preguntas la GPU
            VQA_available = False
            # Dimensiones del contenedor
            wbox = x2 - x1
            hbox = y2 - y1
            dim = (wbox, hbox)
            #Convierte a RGB
            converted = cv2.cvtColor(img,cv2.COLOR_BGR2RGB)
            raw_image = Image.fromarray(converted)
            #Adapta la pregunta al formato
            image = vis_processors["eval"](raw_image).unsqueeze(0).to(device)         
            question = txt_processors["eval"](Questions[currentquestion[idoff]])
            #Para la salida por la consola de visualización
            currentquestionposed = Questions[currentquestion[idoff]]
            #Lanza pregunta            
            res = model.predict_answers(samples={"image": image, "text_input": question}, inference_method="generate")
            #Logs respuestas
            session_vqa_logs_df = session_vqa_logs_df._append({'nframe':int(nframes),'trackid':int(id),\
                        'x1': int(box[0]), 'y1': int(box[1]), 'x2': int(box[2]), 'y2': int(box[3]), 'question':currentquestionposed, 'answer':res[0]}, ignore_index=True)


            #Para la salida por la consola de visualización
            lastquestionanswered.append([id, currentquestionposed, res[0]])
            #Hay límite en cuanto a respuestas a mostrar en la consola de visualización
            if len(lastquestionanswered) >= nmaxquestions2show:
                lastquestionanswered.pop(0)
            #Logs
            #Añade a la lista del trackid y pregunta corerspondiente
            vqa_answers[idoff][currentquestion[idoff]].append(res[0])
            #Controla el tamaño de la lista
            if len(vqa_answers[idoff][currentquestion[idoff]]) > nmaxdescriptors[currentquestion[idoff]]:
                vqa_answers[idoff][currentquestion[idoff]].pop(0)
            #Genera descripción a partir de las respuestas disponibles para este trackid
            if show_eng == 1:
                ComposeDescription_Eng(idoff)
            else:
                ComposeDescription(idoff)
            

    #Salva datos del tracklet, captura y csv
    #Lo hace al llegar al máximo de iteraciones configuradas para la pregunat sobre el sexo
    if currentquestion[idoff] == Questions_alias.index('gender'):
        #Primera vez para este id? En ese caso crea el df
        if len(vqa_answers[idoff][currentquestion[idoff]]) == 1:
            if len(ids_data[idoff]) > 0 :
                ids_data[idoff] = []
            ids_data[idoff].append(id)
            ids_data[idoff].append(idxframe)#fotograma de inicio
        #Ya completó varios ciclos?, actualiza dataframe
        if len(vqa_answers[idoff][currentquestion[idoff]]) == nmaxdescriptors[currentquestion[idoff]]:            
            Stillempty = True
            if ids_df.empty == False:
                #Busca si ya ha presencia de este trackid
                trackid_df = ids_df.loc[ids_df['trackid'] == ids_data[idoff][0]]
                #Si no hay nada en el dataframe para este idtrack
                #set = [record for record in ids_df.values() if record.get('trackid') == ids_data[id - 1][0]]
                if trackid_df.empty == False: 
                    Stillempty = False
            #Si no hay nada asociado a este id del tracking, genera el registro inicial del trackid
            if Stillempty:                  
                new_row = {'session': sessiontime, 'trackid': ids_data[idoff][0], 'frameini': ids_data[idoff][1], 'frameend': idxframe}
                for j in range(len(Questions_alias)):
                    if len(vqa_answers[idoff][j]) > 0:
                        resQ = cadena_mas_repetida(vqa_answers[idoff][j])
                        new_row[Questions_alias[j]] = resQ[0]
                ids_df = pd.concat([ids_df, pd.DataFrame([new_row])], ignore_index=True)
                #Salva una captura reducida y emborronada (por privacidad) del individuo 
                if savelogs == 1:
                    h,w,ch = img.shape
                    #Tamaño del kernel de la gaussiana
                    if h > w:
                        gkernel = int(w/10)
                    else:
                        gkernel = int(h/10)
                    #kernel de tamaño impar
                    if gkernel % 2 == 0:
                        gkernel += 1                    

                    #Compone nombre y salva
                    outputfilename = os.path.join(snapshotspath,sessiontime + '_{:04d}'.format(ids_data[idoff][0]) + '_{:04d}'.format(ids_data[idoff][1]) + '.png')
                    blur = cv2.GaussianBlur(cv2.resize(img, (int(w/2), int(h/2))),(gkernel,gkernel),0)
                    cv2.imwrite(outputfilename, blur)
                

            #en otro caso modifica el campo de fotograma final del trackid
            else: #
                ids_df.loc[ids_df['trackid'] == ids_data[idoff][0], 'frameend'] = idxframe

            #Va salvando información resumen de cada trackid con descripción completa
            if savelogs == 1 and os.path.exists(snapshotspath):
                ids_df.to_csv(os.path.join(snapshotspath,sessiontime+'.csv'), index=False)  
    #Se pepara para la siguienet prefunta de la lista
    currentquestion[idoff] += 1
    if currentquestion[idoff] >= len(Questions):
        currentquestion[idoff] = 0

    #Libera el procesado de preguntas
    VQA_available = True

#Traduce color a castellano, pueden faltar
def TraduceColor(colname,fem = False):
    #Pueden aparecer colores no contemplados
    colname = colname.replace('and','y')
    colname = colname.replace('blue','azul')
    colname = colname.replace('gray','gris')
    colname = colname.replace('grey','gris')
    colname = colname.replace('orange','naranja')
    colname = colname.replace('green','verde')
    colname = colname.replace('brown','marrón')
    colname = colname.replace('tan','canela')

    #Varía si es maculina o femenina la palabra a la que califica
    if fem == False:    
        colname = colname.replace('black','negro')
        colname = colname.replace('white','blanco')
        colname = colname.replace('red','rojo')
        colname = colname.replace('yellow','amarillo')
        colname = colname.replace('purple','morado')
    else:
        colname = colname.replace('black','negra')
        colname = colname.replace('white','blanca')
        colname = colname.replace('red','roja')
        colname = colname.replace('yellow','amarilla')
        colname = colname.replace('purple','morada')

    return colname

#Versión castellano que compone descripción desde las respuestas obtenidas
def ComposeDescription(id):
    global vqa_answers
    global descriptions
    global smiled,nidssmiled,facesseen,nidsfacesseen

    description = ''
    
    #Sexo
    resG = cadena_mas_repetida(vqa_answers[id][Questions_alias.index('gender')])
    if resG[0] == 'male':
        description = 'Masculino'

        #Barba, sólo para masculinos
        if len(vqa_answers[id][Questions_alias.index('beard')]) > 0:
            resBeard = cadena_mas_repetida(vqa_answers[id][Questions_alias.index('beard')])
            #Pelo en la cara
            if resBeard[0] != 'yes':
                if len(vqa_answers[id][Questions_alias.index('hair_face')]) > 0:
                    resShaved = cadena_mas_repetida(vqa_answers[id][Questions_alias.index('hair_face')])
                    if resShaved[0] == 'chin':
                        description += ' sin afeitar'
            else:
                description += ' con barba'
    else:
        description = 'Femenino'

    #Adulto
    if len(vqa_answers[id][Questions_alias.index('adultornot')]) > 0:
        resGl = cadena_mas_repetida(vqa_answers[id][Questions_alias.index('adultornot')])
        description += '\n'
        if resGl[0] == 'yes':
            description += 'adulto'
        else:
            description += 'menor'

        #pregunta que depende de ver la cara
        if facesseen[id] == False:
            nidsfacesseen += 1
            facesseen[id] = True


    #Emoción
    if len(vqa_answers[id][Questions_alias.index('emotion')]) > 0:
        resGl = cadena_mas_repetida(vqa_answers[id][Questions_alias.index('emotion')])
        description += ' '
        if resGl[0] == 'smiling' or resGl[0] == 'smile':
            description += 'sonriente'
            #No lo había visto sonreír, contabiliza
            if smiled[id] == False:
                nidssmiled += 1
                smiled[id] = True
        else:
            if resGl[0] == 'sad':
                description += 'triste'
            else:
                if resGl[0] == 'serious':
                    description += 'serio'
                else:
                    if resGl[0] == 'surprise' or resGl[0] == 'surprised':
                        description += 'sorprendido'
                    else:
                        if resGl[0] == 'frown':
                            description += 'enfadado'
                        else:
                            description += resGl[0]
        

    #Gafas
    if len(vqa_answers[id][Questions_alias.index('glasses')]) > 0:
        resGl = cadena_mas_repetida(vqa_answers[id][Questions_alias.index('glasses')])
        description += '\n'
        if resGl[0] == 'yes':
            description += 'con gafas'
            #De sol?
            if len(vqa_answers[id][Questions_alias.index('sunglasses')]) > 0:
                resSGl = cadena_mas_repetida(vqa_answers[id][Questions_alias.index('sunglasses')])
                if resSGl[0] == 'yes':
                    description += ' de sol'
        else:
            description += 'sin gafas'

    #Pelo
    if len(vqa_answers[id][Questions_alias.index('hair_length')]) > 0:
        resH = cadena_mas_repetida(vqa_answers[id][Questions_alias.index('hair_length')])
        description += '\n'
        
        if resH[0] == 'short':
            description += 'pelo corto'
        else:
            description += 'pelo largo'

        #color pelo
        if len(vqa_answers[id][Questions_alias.index('hair_color')]) > 0:
            resHc = cadena_mas_repetida(vqa_answers[id][Questions_alias.index('hair_color')])
            if resHc[0] == 'black':
                description += ' negro'
            else:
                if resHc[0] == 'brown':
                    description += ' castaño'
                else:
                    if resHc[0] == 'blonde':
                        description += ' rubio'
                    else:#otros casos
                        TColor = TraduceColor(resHc[0], True)
                        description += ' ' + TColor

    #color ojos
    if len(vqa_answers[id][Questions_alias.index('eyes_color')]) > 0:
        description += '\n'
        resEc = cadena_mas_repetida(vqa_answers[id][Questions_alias.index('eyes_color')])
        if resEc[0] == 'brown':
            description += 'ojos marrones'
        else:
            if resEc[0] == 'blue':
                description += 'ojos azules'
            else:
                description += 'ojos ' + resEc[0]

       
    #Color parte superior
    if len(vqa_answers[id][Questions_alias.index('shirt_color')]) > 0:
        resCc = cadena_mas_repetida(vqa_answers[id][Questions_alias.index('shirt_color')])
        description += '\n'
        TColor = TraduceColor(resCc[0])
        #Hay infrmación de los brazos?
        if len(vqa_answers[id][Questions_alias.index('arms')]) == 0:
            description += 'torso ' + TColor
        else:
            #Hay respuesta de las mangas
            if len(vqa_answers[id][Questions_alias.index('sleeves')]) > 0:
                #longitud mangas
                resLS = cadena_mas_repetida(vqa_answers[id][Questions_alias.index('sleeves')])
                if resLS[0] == 'short':
                    TColor = TraduceColor(resCc[0], True)
                    description += 'camiseta ' + TColor
                else:                
                    #Prenda larga
                    if len(vqa_answers[id][Questions_alias.index('pulleover_etc')]) > 0:
                        #Hay chaqueta para tener respuesta
                        resN = cadena_mas_repetida(vqa_answers[id][Questions_alias.index('pulleover_etc')])
                        #print(vqa_answers[id][Questions_alias.index('pulleover_etc')])
                        
                        if resN[0] == 'hoodie':
                            TColor = TraduceColor(resCc[0], True)
                            description += 'sudadera con capucha '+ TColor
                        else:
                            if resN[0] == 'jacket':
                                TColor = TraduceColor(resCc[0], True)
                                if len(vqa_answers[id][Questions_alias.index('jacket_color')]) > 0:
                                    resChc = cadena_mas_repetida(vqa_answers[id][Questions_alias.index('jacket_color')])
                                    JColor = TraduceColor(resChc[0], True)
                                    description += 'chaqueta '+ JColor + ' y camiseta ' + TColor
                                else:
                                    description += 'chaqueta y camiseta ' + TColor
                            else:
                                if 'shirt' in resN[0] or 'sleeve' in resN[0]:
                                    description += 'camisa larga '+ TColor
                                else:
                                    description += 'pullover '+ TColor
                    else:
                        description += 'prenda larga ' + TColor
            else:
                description += 'torso ' + TColor

        #stripes
        if len(vqa_answers[id][Questions_alias.index('shirt_stripes')]) > 0:
            resRa = cadena_mas_repetida(vqa_answers[id][Questions_alias.index('shirt_stripes')])
            if  resRa[0] == 'yes':
                description += '\nde rayas'
                if  len(vqa_answers[id][Questions_alias.index('stripes_orientation')]) > 0:
                    resRay = cadena_mas_repetida(vqa_answers[id][Questions_alias.index('stripes_orientation')])
                    if  resRay[0] == 'yes':
                        description += ' verticales'

    #Color parte inferior
    if len(vqa_answers[id][Questions_alias.index('pants_color')]) > 0:
        resCp = cadena_mas_repetida(vqa_answers[id][Questions_alias.index('pants_color')])
        description += '\n'
        
        resLB = cadena_mas_repetida(vqa_answers[id][Questions_alias.index('pants')])
        if resLB[0] != 'yes':
            if resLB[0] == 'shorts':
                TColor = TraduceColor(resCp[0])
                description += 'pantalón corto ' + TColor
            else:
                if resLB[0] == 'pants':
                    TColor = TraduceColor(resCp[0])
                    description += 'pantalón ' + TColor
                else:
                    TColor = TraduceColor(resCp[0],True)
                    description += 'parte inferior ' + TColor
        else:
            TColor = TraduceColor(resCp[0],True)
            description += 'parte inferior ' + TColor
            
    #tipo cuello
    if len(vqa_answers[id][Questions_alias.index('collar_type')]) > 0:
        #description += '\n'
        resTc = cadena_mas_repetida(vqa_answers[id][Questions_alias.index('collar_type')])
        if resTc[0] == 'buttoned':
            description += '\ncuello con botones'
        
        #elif  resTc[0] == 'v neck':
        #    description += 'cuello en V'
        #else:
        #    description += 'cuello ' + resTc[0]



    #Se acuerda si ha sonreído
    if smiled[id]:
        description += '\ny te he visto sonreír'

    descriptions[id] = description
    #print(id, descriptions)


#Versión inglés de composición de la descripción
def ComposeDescription_Eng(id):
    global vqa_answers
    global descriptions

    description = ''
    
    #Sexo
    resG = cadena_mas_repetida(vqa_answers[id][Questions_alias.index('gender')])
    if resG[0] == 'male':
        description = 'Male'

        #Barba, sólo para masculinos
        if len(vqa_answers[id][Questions_alias.index('beard')]) > 0:
            resBeard = cadena_mas_repetida(vqa_answers[id][Questions_alias.index('beard')])
            #Pelo en la cara
            if resBeard[0] != 'yes':
                if len(vqa_answers[id][Questions_alias.index('hair_face')]) > 0:
                    resShaved = cadena_mas_repetida(vqa_answers[id][Questions_alias.index('hair_face')])
                    if resShaved[0] == 'chin':
                        description += ' unshaved'
            else:
                description += ' with beard'
    else:
        description = 'Female'

    #Adulto
    if len(vqa_answers[id][Questions_alias.index('adultornot')]) > 0:
        resGl = cadena_mas_repetida(vqa_answers[id][Questions_alias.index('adultornot')])
        description += '\n'
        if resGl[0] == 'yes':
            description += 'adult'
        else:
            description += 'minor'

    #Gafas
    if len(vqa_answers[id][Questions_alias.index('glasses')]) > 0:
        resGl = cadena_mas_repetida(vqa_answers[id][Questions_alias.index('glasses')])
        description += '\n'
        if resGl[0] == 'yes':
            description += 'with glasses'
        else:
            description += 'no glasses'


    #Pelo y color
    if len(vqa_answers[id][Questions_alias.index('hair_length')]) > 0:
        resH = cadena_mas_repetida(vqa_answers[id][Questions_alias.index('hair_length')])
        if len(vqa_answers[id][Questions_alias.index('hair_color')]) > 0:
            resHc = cadena_mas_repetida(vqa_answers[id][Questions_alias.index('hair_color')])
            description += '\n' + resH[0] + ' ' + resHc[0] + ' hair'
        else:
            description += '\n' + resH[0] + ' hair'
   
                   
    #color ojos
    if len(vqa_answers[id][Questions_alias.index('eyes_color')]) > 0:
        resEc = cadena_mas_repetida(vqa_answers[id][Questions_alias.index('eyes_color')])
        description += '\n' + resEc[0] + ' eyes'
       
    #Color parte superior
    if len(vqa_answers[id][Questions_alias.index('shirt_color')]) > 0:
        description += '\n'
        resCc = cadena_mas_repetida(vqa_answers[id][Questions_alias.index('shirt_color')])
        
        if len(vqa_answers[id][Questions_alias.index('sleeves')]) == 0:
            description += resCc[0] + ' upper body'
        else:
            resLS = cadena_mas_repetida(vqa_answers[id][Questions_alias.index('sleeves')])
            if resLS[0] == 'short':
                description += resCc[0] + ' short shirt'

                

            else:                
                #Prenda larga
                if len(vqa_answers[id][Questions_alias.index('pulleover_etc')]) > 0:
                    #Hay chaqueta para tener respuesta
                    resN = cadena_mas_repetida(vqa_answers[id][Questions_alias.index('pulleover_etc')])                    
                    if resN[0] == 'hoodie':
                        description += resCc[0] + ' hoodie'
                    else:
                         if resN[0] == 'jacket':
                             TColor = TraduceColor(resCc[0], True)
                             if len(vqa_answers[id][Questions_alias.index('jacket_color')]) > 0:
                                resChc = cadena_mas_repetida(vqa_answers[id][Questions_alias.index('jacket_color')])
                                description += resChc[0] + ' jacket and ' + resCc[0] +  'shirt'
                             else:
                                description += ' jacket and ' + resCc[0] +  'shirt'
                         else:
                             description += resCc[0] + ' pullover'
                else:
                    description += resCc[0] + ' long shirt'



        #stripes
        if len(vqa_answers[id][Questions_alias.index('shirt_stripes')]) > 0:
            resRa = cadena_mas_repetida(vqa_answers[id][Questions_alias.index('shirt_stripes')])
            if  resRa[0] == 'yes':
                description += '\n'
                if  len(vqa_answers[id][Questions_alias.index('stripes_orientation')]) > 0:
                    resRay = cadena_mas_repetida(vqa_answers[id][Questions_alias.index('stripes_orientation')])
                    description += 'with ' + resRay[0] + ' stripes'                    
                else:
                    description += 'with stripes'

    #Color parte inferior
    if len(vqa_answers[id][Questions_alias.index('pants_color')]) > 0:
        resCp = cadena_mas_repetida(vqa_answers[id][Questions_alias.index('pants_color')])
        description += '\n'
        TColor = TraduceColor(resCp[0])
        description += resCp[0] + 'lower body '
            
    #tipo cuello
    if len(vqa_answers[id][Questions_alias.index('collar_type')]) > 0:
        #description += '\n'
        resTc = cadena_mas_repetida(vqa_answers[id][Questions_alias.index('collar_type')])
        if resTc[0] == 'buttoned':
            description += '\nbuttoned'
        
        #elif  resTc[0] == 'v neck':
        #    description += 'cuello en V'
        #else:
        #    description += 'cuello ' + resTc[0]

    descriptions[id] = description
    #print(id, descriptions)


## get Screen Size in linux/windows
sc_w,sc_h = tk.Tk().winfo_screenwidth(), tk.Tk().winfo_screenheight()
print('Resolución de pantalla', sc_w,sc_h)

#Por un error que aparecía https://github.com/explosion/spaCy/issues/7664
os.environ['KMP_DUPLICATE_LIB_OK']='True'

# setup device to use
useCuda = True
if useCuda:
	device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
	deviceyolo = torch.device("cuda" if torch.cuda.is_available() else "cpu")

else:
	device = torch.device("cpu")
	deviceyolo = torch.device("cpu")

print("Device: ", device)
print("Device YOLO: ", deviceyolo)

#VQA
#Visual question answering (VQA)
model, vis_processors, txt_processors = load_model_and_preprocess(name="blip_vqa", model_type="vqav2", is_eval=True, device=device)
print("Modelo VQA cargado")
#Inicializaciones para el hilo VQA
VQA_available = True
nids_saved = 0

#La estructura de las preguntas es liosa, fue surgiendo sobre la marcha, seguramente no es la óptima
#Listado de preguntas
Questions = ["Is the person male or female?","What color is the person shirt?","Has the person a beard?", "Where has the person hair in the face?",\
             "Has the person short or long hair?","Which color is the person hair?", "Do you see the person's eyes?", "Do you see the person's face?","Does the person wear glasses?","Is the person wearing sunglasses?",\
            "Which color is the person's eyes?","What type of collar does the shirt have?", "Has the person's shirt stripes?", "Are the person's shirt stripes vertical?",\
            "Do you see the person's arms?", "Are the sleeves short or long?","Does the person wears a long-sleeved shirt, jacket, pullover or hoodie?","What color is the person's jacket?",\
            "Do you see the person's legs?","What color are the person pants?", 'Is the person an adult?',"What basic facial expression is the person displaying?"]
#"What is the facial expression of the person?" "What basic facial expression is the person displaying?"" "Is the person angry, disgusted, happy, sad, fearful, surprised or neutral?"

#Alias de cada descriptor, debe ser coherente con el anterior para evitar trastornos
Questions_alias = ['gender', 'shirt_color','beard', 'hair_face',\
                    'hair_length','hair_color', 'eyes', 'face','glasses', 'sunglasses',\
                    'eyes_color', 'collar_type', 'shirt_stripes', 'stripes_orientation',\
                    'arms', 'sleeves','pulleover_etc', 'jacket_color', \
                    'pants', 'pants_color', 'adultornot','emotion']

 
#Número máximo de veces que se realiza una pregunta, un valor para ceda una. Se hacia una votación para la descripción
nmaxdescriptors = [9, 1, 1, 1, \
                   1, 1, 1, 1, 1, 1,\
                   1, 1, 1, 1, \
                   1, 1, 1, 1, \
                   1, 1, 1, 1]

#Valor de relación de altura mínima pedida para el contenedor de la persona
height_threshold = [0.1, 0.1, 0.5, 0.4, \
                   0.3, 0.3, 0.3, 0.4, 0.3, 0.3,\
                   0.7, 0.5, 0.5, 0.8, \
                   0.4, 0.4, 0.4, 0.4, \
                   0.2, 0.2, 0.5, 0.5]

#Descriptores que pueden cambiar durante la interacción, sigue repitiendo la pregunta, si no se activa, al alcanzar el número máximo, la pregunta no se sigue repitiendo
# 1 sigue preguntando sin restricción
# 10 sigue preguntando hasta que se confirme que se ha obtenido una respuesta (se usa para poder lanzar otras preguntas)
# por ejemplo que se ven los brazos, necesario para saber las mangas
# pos 7 ojos, interesa que sean visibles para preguntar otras cosas
# pos 8 gafas, interesa ver si cambia
# pos 12 brazos/manos, interesa que sean visibles para preguntar otras cosas como las mangas largas
# pos 16 pantalones, interesa que sean visibles para preguntar el color
keepasking = [0, 0, 0, 0, \
              0, 0, 10, 10, 1, 1,\
              0, 0, 0, 0, \
              10, 0, 0, 0,\
              10, 0, 0, 1]
#Respuesta que se busca con repetición, en general que sea visible algún elemento, o que tenga una respuesta determinada o presente en un listado
# por ejemplos ojos visibles, brazos, parte inferior
keepasking_condition = ['', '', '', '', \
                        '', '', 'yes', 'yes', '','', '',''\
                       '', '','', '' ,\
                       'yes', '', '', '',\
                       ['yes', 'pants', 'trousers', 'shorts', 'skirt'], '', '']
#pregunta condicionada por otra, -1 si no depende de otra, en otro caso la pregunta

#Indices de preguntas que precondicionan
q_viseyes = Questions_alias.index('eyes')
q_visface = Questions_alias.index('face')
q_glasses = Questions_alias.index('glasses')
q_stripes = Questions_alias.index('shirt_stripes')
q_visarms = Questions_alias.index('arms')
q_longsleeves = Questions_alias.index('sleeves')
q_jacket = Questions_alias.index('pulleover_etc')
q_vislowbody = Questions_alias.index('pants')
# pos 2 y 3 barba y pelo en la cara solo si es masculino, indicado en pos 0
# pos 7 gafas, interesa que sean visibles los ojos para preguntarlo, indicado en q_viseyes
# pos 8 color ojos, interesa que sean visibles, indicado en q_viseyes (falta eliminar respuesta si hay gafas de sol)
# pos 11 orientación de las ´lineas si las detecta, indicado en al 10
# pos 12 mangas, interesa que se vean los brazos para preguntarlo, indicado en la 11
# pos 13 tipo prenda larga, interesa que sea manga larga preguntarlo, indicado en la 12
# pos 14 color chaqueta, interesa que sea chaqueta pàra preguntarlo, indicado en la 13
# pos 17 color pantalones, interesa que se vean, indicado en la 16
# pos 18 adulto, interesa que se vean los ojos, indicado en q_viseyes
precondition_question = [-1, -1 , q_visface, q_visface,\
                        -1, -1 , -1, -1, q_visface,q_glasses,\
                        q_viseyes , -1,-1,q_stripes,\
                        -1, q_visarms, q_longsleeves, q_jacket,\
                         -1, q_vislowbody, q_visface, q_visface]
precondition_value = ['', '', 'yes', 'yes',\
                      '','', '', '', 'yes','yes',\
                       'yes', '', '','yes' ,\
                       '', 'yes', 'long', 'jacket',\
                      '', ['yes', 'pants', 'trousers', 'shorts', 'skirt'], 'yes', 'yes']

#Para mostrar en pantalla una especie de consola
lastquestionanswered = []
currentquestionposed = ''
nmaxquestions2show = 20

# Carga del modelo yolov8 para detección
modelYOLO = YOLO('yolov8n.pt') #Contenedores
print("Modelo YOLO cargado")
debug = 0

#Camara o video
UseCam = True#True or False
height_th = 0.15#0.4 en demos con cámara habitualmente
if UseCam:
    vid = cv2.VideoCapture(0)
    print("Cámara activada")
else:
    #vid = cv2.VideoCapture("Z:/DeOtros/MOT16/MOTS20-11-raw.webm")
    vid = cv2.VideoCapture("C:/Users/modesto/Desktop/MOTS20-11-raw.webm")
    #vid = cv2.VideoCapture("Z:/iROC/iROC_audiovisual/GoproHeroMAX/LasPalmasGC/Alcaravaneras/GH010197.mp4")
    #vid = cv2.VideoCapture("Z:/iROC/iROC_audiovisual/GoproHeroMAX/LasPalmasGC/Enbici/GH010004_extract.mp4")
    print("Archivo cargado")


#Salvar capturas resumen
savelogs = 1
#Ruta
snapshotspath = './tmp'#Si no existe, no se salva
sessiontime = 'HRI_session_' + time.strftime("%Y%m%d-%H%M%S")

#savevideo
savevideo = 0
result = 0
savefull = 0 #defines if saving the whole output or just the image

#Muestra trayectoria de las personas seguidas si activada
showpath = 0

#Comentarios sobre imagen en castellano o inglés
show_eng = 0

#Stats
nidssmiled = 0
nidsfacesseen = 0

# Lista con datos de identidades, como máximo nmaxids, 
#el tracking no para de crecer, por lo que se reutilizan, si alguien
#permanece mucho, sus datos se repiten en el id del tracking + nmaxids
ids_df = pd.DataFrame({})
nmaxids = 1000 #ids de las que mantiene datos contemporáneamente
lastid = -1
lasthighesttrackid = 0
vqa_answers = []
currentquestion = []
descriptions = []
smiled = []
facesseen = []
ids_data = []
ids_bbs = []#histórico de contenedores
for i in range(nmaxids):
    currentquestion.append(0)
    vqa_answers.append([])
    ids_data.append([])
    ids_bbs.append([])
    descriptions.append('')
    smiled.append(False)
    facesseen.append(False)
    for j in range(len(Questions)):
        vqa_answers[i].append([])

#logs de las detecciones
df_columns = ['nframe','trackid','confidence','x1', 'y1', 'x2', 'y2']
session_detection_logs_df = pd.DataFrame(columns=df_columns)
#logs de las preguntas/respuestas
df_columns = ['nframe','trackid','x1', 'y1', 'x2', 'y2','question','answer']
session_vqa_logs_df = pd.DataFrame(columns=df_columns)


#Tipografía PIL, mejor calidad de salida
fontsize = 20 #era 16
font = ImageFont.truetype("arial.ttf", size=fontsize)
usePIL = True

#logos y sus redimensionados, adaptar con las necesidades
showlogos = True
if os.path.exists("images/eii_hmr_acron.jpg") and os.path.exists("images/siani_rev_hmr_acronim.jpg"):
    logotmp = cv2.imread("images/eii_hmr_acron.jpg")
    logo = cv2.resize(logotmp, (0, 0), fx = 0.2, fy = 0.2)
    hlogo,wlogo,chlogo = logo.shape
    hlogo2 = int(hlogo/2)
    wlogo2 = int(wlogo/2)
    logotmp = cv2.imread("images/siani_rev_hmr_acronim.jpg")
    logoB = cv2.resize(logotmp, (0, 0), fx = 0.16, fy = 0.16)
    hlogoB,wlogoB,chlogoB = logoB.shape
    hlogoB2 = int(hlogoB/2)
    wlogoB2 = int(wlogoB/2)
else:
    print('Logos no disponibles')
    showlogos = False

#Tamaño de la pregunta más larga, se usa para determinar tamaño de la ventana de salida
longest_question_length = len(max(Questions, key=len))

#Propiedades ventana visualización
winname = "Output"
cv2.namedWindow(winname)        

#Bucle de captura
nframes = 0
while(True):      
    # fotograma a fotograma
    if UseCam:
        ret, frameIN = vid.read()
    else:
        ret, frame = vid.read()
    # Si  hay buen aimagen
    if ret: 
        nframes += 1
        # Aplica efecto espejo sobre la entrada
        if UseCam:
            hf,wf,cfh = frameIN.shape
            frame=cv2.flip(frameIN, 1)
        
        hf,wf,cfh = frame.shape

        #Detecta y sigue persona con yolo
        resultsYOLO = modelYOLO.track(frame, classes=[0],persist=True, verbose=False)
        #Adapta a pil 
        pil_frame = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        draw = ImageDraw.Draw(pil_frame, "RGBA")  #RGBA para transparencias
        #Si hay detección(es) de persona
        if resultsYOLO[0].boxes.id is not None:            
            boxes = resultsYOLO[0].boxes.xyxy.cpu().numpy().astype(int)
            confs = resultsYOLO[0].boxes.conf.cpu().numpy().astype(float)
            ids = resultsYOLO[0].boxes.id.cpu().numpy().astype(int)

            #Chequea si la id del tracking es superior al máximo, lo que implica resetear las ya usadas en la lista (chapucilla)
            maxtrackid = np.max(ids)
            if maxtrackid > lasthighesttrackid:
                if maxtrackid > nmaxids:
                    for idx in range(lasthighesttrackid, maxtrackid):
                        currentquestion[(idx -1)%nmaxids] = 0
                        vqa_answers[(idx -1)%nmaxids] = []
                        ids_data[(idx -1)%nmaxids] = []
                        ids_bbs[(idx -1)%nmaxids] = []
                        descriptions[(idx -1)%nmaxids] = ''
                        smiled[(idx -1)%nmaxids] = False
                        for j in range(len(Questions)):
                            vqa_answers[(idx -1)%nmaxids].append([])
            
                lasthighesttrackid = maxtrackid

            # Ordena contenedores por área para pintar de más pequeña a mayor
            sorted_indices = sorted(range(len(boxes)), key=lambda i: calculate_area(boxes[i]))

            # reordena resto de listas
            sorted_boxes = [boxes[i] for i in sorted_indices]
            sorted_confs = [confs[i] for i in sorted_indices]
            sorted_ids = [ids[i] for i in sorted_indices]
            
            #Recorre las personas detectadas y seguidas con YOLO
            #for box, conf, id in zip(boxes, confs, ids): #Versión sin ordenar por tamaños los contenedores
            #Recorre en orden ascendente de los contenedores (los mayores se dibujan al final)
            for box, conf, id in zip(sorted_boxes, sorted_confs, sorted_ids):#recorre en sentido ascendente de áreas
            
                # Confianza de la detección
                confidence = math.ceil((conf*100))/100
                # logs de detecciones
                session_detection_logs_df = session_detection_logs_df._append({'nframe':int(nframes),'trackid':int(id),'confidence':confidence,\
                                            'x1': int(box[0]), 'y1': int(box[1]), 'x2': int(box[2]), 'y2': int(box[3])}, ignore_index=True)

                #obtiene identificador en la lista
                idoff = (id - 1)%nmaxids
                #Pinta y escribe sobre imagen PIL, mejor estética del texto
                if usePIL:
	                #Contenedor                 
                    draw.line([(box[0], box[1]), (box[2], box[1])], fill ="gray", width = fontsize)
                    draw.line([(box[0], box[1]), (box[0], box[1] + 20)], fill ="gray", width = 3)
                    draw.line([(box[2], box[1]), (box[2], box[1] + 20)], fill ="gray", width = 3)
                    #Almacena valores contenedor
                    ids_bbs[idoff].append([box[0], box[1],box[2], box[3]])
                    #Dibuja estela cinco últimos
                    if showpath == 1:
                        # Select the last five bounding boxes (or fewer if available)
                        last_five_bounding_boxes = ids_bbs[idoff][-5:]
                        # Obtiene centroides
                        centers = [(int((x1 + x2) / 2), int((y1 + y2) / 2)) for x1, y1, x2, y2 in last_five_bounding_boxes]
                        # Draw the polyline (you can customize color and width)
                        draw.line(centers, fill='white', width=3)
                    
                    #Muestra confianza de la detección con yolo
                    if 0:
                        draw.text((box[0], box[1]), f"Id {id} conf {confidence}", fill=(0, 0, 255))

		            #Muestra descripción de la persona                    
                    if len(descriptions) >= idoff:#Hay descripción
                        if 1:#boxdescription2show[id]:
                            #Texto con fondo semitransparente
                            bbox = draw.textbbox((box[0], box[1]-int(fontsize/2)), f"{id}.\n{descriptions[idoff]}", font=font)
                            draw.rectangle(bbox, fill=(128,128,128,180))#último valor transparencia
                            #Descripciones por líneas
                            draw.text((box[0], box[1]-int(fontsize/2)), f"{id}.\n{descriptions[idoff]}", fill=(20, 20, 20), font = font) 
                        else:
                            #Solo yolo id
                            draw.text((box[0], box[1]-int(fontsize/2)), f"{id}", fill=(20, 20, 20), font = font)

                                                       

                #Obsoleto. Pinta y escribe sobre imagen opencv, peor calidad fuente, sin tildes ...
                else:
                    #Muestra datos
                    #cv2.rectangle(frame, (box[0], box[1]), (box[2], box[3]), (0, 255, 0), 2)
                    cv2.line(frame, (box[0], box[1]), (box[2], box[1]), (128, 128, 128), 5)
                    cv2.line(frame, (box[0], box[1]), (box[0], box[1] + 20), (128, 128, 128), 2)
                    cv2.line(frame, (box[2], box[1]), (box[2], box[1] + 20), (128, 128, 128), 2)
                    #Datos de confianza, depuración
                    if 0:
                        cv2.putText(
                            frame,
                            f"Id {id} conf {confidence}",
                            (box[0], box[1]),
                            cv2.FONT_HERSHEY_SIMPLEX,
                            1,
                            (0, 0, 255),
                            2,
                        )

                    #Descripción del contenedor
                    if 1:#boxdescription2show[id]:
                        if len(descriptions) >= idoff:
                            cv2.putText(
                            frame,
                            f"{id} {descriptions[id - 1]}",
                            (box[0], box[1] -5),  
                            cv2.FONT_HERSHEY_SIMPLEX,
                            0.4,
                            (120, 255, 255),
                            2,
                        )

                #El contenedor debe ser bastante alto en relación a la pantalla para lanzar preguntas, dar prioridad al primer plano
                if box[3]- box[1] > hf * height_th:
                    #Lanza hilo VQA, intenta ir alternando ids cuando hay varias para no monopolizar a la que se pregunta, pensando en equipos con pocos recursos
                    if VQA_available and (len(ids) == 1 or lastid != id):
                        #Lanza hilo en la zona de interés con preguntas VQA                  
                        try:
                            hilo = threading.Thread(target=VQA_Process, args=(frame[box[1]:box[3],box[0]:box[2]],box[0], box[1],box[2], box[3], id, nframes ))
                            VQA_available = False
                            hilo.start()
                            lastid = id
                        except:
                            print('Error en hilo')
     
    else:#Termina en el caso de estar con vídeo
        if UseCam == False and nframes >= int(vid.get(cv2.CAP_PROP_FRAME_COUNT)):
            break
   
    # Muestra el fotograma con anotaciones
    if usePIL and nframes > 0:
        img2show = cv2.cvtColor(np.array(pil_frame), cv2.COLOR_RGB2BGR)
        h,w,ch = img2show.shape
        #Superpone logo(s)
        if showlogos:
            img2show[int(h)-hlogoB:int(h),int(w/2)-wlogoB2:int(w/2)+wlogoB2] = logoB

	    #Imagen más amplia para mostrar a la derecha preguntas recientes, mantiene proporciones pantalla
        w4logs = w + ((longest_question_length + 10)*7) #7 por el ancho de la tipografía ??? (a ojo)
        #Al adaptar el ancho a la pantalla, adapta alto 
        hoff = int(w4logs*sc_h/sc_w - (h - 40))
        if hoff < 0:
            hoff = 0
        imgextended = np.zeros((h+hoff, w4logs,3), dtype=np.uint8) 
        imgextended[0:h,0:w] = img2show
        hext,wext,chext = imgextended.shape
        
        #MUESTRA PREGUNTAS RECIENTES EN ZONA DE LA DERECHA
        #A modo de consola con últimas preguntas
        qoff = 14        
        offx = w + 1 
        #offy = h-qoff*nmaxquestions2show - int(qoff/4)
        offy = int(qoff/4)
        
        #Estética degradado listado de preguntas recientes, al principio suma para evitar que empiecenn en negro
        offq = 0
        if len(lastquestionanswered) < nmaxquestions2show:
            offq = nmaxquestions2show - len(lastquestionanswered)
        for iq in range(len(lastquestionanswered)): 
            PyR= '> (' + str(lastquestionanswered[iq][0])+ ') ' + lastquestionanswered[iq][1] + ' ' + lastquestionanswered[iq][2]
            cv2.putText(imgextended,PyR, (offx,offy + (iq+1) *qoff),cv2.FONT_HERSHEY_SIMPLEX, 0.4,((offq+iq+1)*25, (offq+iq+1)*25, (offq+iq+1)*25), 1)

	    #Mostrar preguntas previas en pantalla sobre la zona de la persona
        if currentquestionposed != '':
            PyR=  '>' + currentquestionposed
            cv2.putText(imgextended,PyR, (offx,offy + nmaxquestions2show *qoff),cv2.FONT_HERSHEY_SIMPLEX, 0.4,(0, 255,0), 1)



        #CUENTAS
        
        if nidsfacesseen >= 1:
            if nidsfacesseen == 1:
                cv2.putText(imgextended,'He mirado a los ojos a '+ str(nidsfacesseen) + ' persona.', (offx,offy + (nmaxquestions2show+5) *qoff),cv2.FONT_HERSHEY_SIMPLEX, 0.4,(255, 255,255), 1)
            else:
                cv2.putText(imgextended,'He mirado a los ojos a '+ str(nidsfacesseen) + ' personas.', (offx,offy + (nmaxquestions2show+5) *qoff),cv2.FONT_HERSHEY_SIMPLEX, 0.4,(255, 255,255), 1)
        if nidssmiled >= 1:
            if nidssmiled == 1:
                cv2.putText(imgextended,'De momento, '+ str(nidssmiled) + ' me ha mostrado su sonrisa', (offx,offy + (nmaxquestions2show+6) *qoff),cv2.FONT_HERSHEY_SIMPLEX, 0.4,(255, 255,255), 1)
            else:
                cv2.putText(imgextended,'De momento, '+ str(nidssmiled) + ' me han mostrado su sonrisa', (offx,offy + (nmaxquestions2show+6) *qoff),cv2.FONT_HERSHEY_SIMPLEX, 0.4,(255, 255,255), 1)
        
        #Maximiza tamaño para la resolución disponible
        scaleWidth = float(sc_w)/float(wext)
        #scaleHeight = float(sc_h-40)/float(hext)#Quitando parte inferior
        scaleHeight = float(sc_h)/float(hext)
        if scaleHeight>scaleWidth:
            imgScale = scaleWidth
        else:
            imgScale = scaleHeight
 	    #Dimensiones para cubrir pantalla
        newW,newH = imgextended.shape[1]*imgScale, imgextended.shape[0]*imgScale
        final2show = cv2.resize(imgextended,(int(newW),int(newH)))

        # print the max values of the channels
        #print(np.max(final2show[:,:,0]),np.max(final2show[:,:,1]),np.max(final2show[:,:,2]))
        # final2show = cv2.cvtColor(final2show, cv2.COLOR_BGR2RGB)
        cv2.moveWindow(winname, 0,20)
        cv2.setWindowProperty(winname, cv2.WND_PROP_FULLSCREEN,
                          cv2.WINDOW_FULLSCREEN)
        cv2.imshow(winname, final2show)

        if savevideo == 1:
            if os.path.exists(snapshotspath):
                #Prepara salida de video
                if nframes == 1: 
                    #frame_width = int(vid.get(3)) 
                    #frame_height = int(vid.get(4)) 
                    fps = vid.get(cv2.CAP_PROP_FPS)
                    
                    if savefull == 1:
                        result = cv2.VideoWriter(os.path.join(snapshotspath,'DemoVQAoutput.avi'),  
                                cv2.VideoWriter_fourcc(*'MJPG'), 
                                fps, (int(newW),int(newH))) 
                    else:
                        result = cv2.VideoWriter(os.path.join(snapshotspath,'DemoVQAoutput.avi'),  
                                cv2.VideoWriter_fourcc(*'MJPG'), 
                                fps, (int(w),int(h))) 
                    
                if savefull == 1:
                    result.write(final2show) 
                else:
                    result.write(img2show) 

            else:
                savevideo = 0
                print('Ruta de vídeo no existente')
    else:
        # show in cv2
        if usePIL == False:
            cv2.imshow('OpenCV', final2show)
    #pil_frame.show()

    # Detenemos pulsado ESC
    key = cv2.waitKey(20)
    if key == 27:
        break
    elif key == 102 or key == 70:#Salva imagen al pulsar f
        cv2.imwrite(os.path.join(snapshotspath,sessiontime+str(nframes).zfill(10)+'.jpg'), final2show)

#Salva logs detecciones
session_detection_logs_df.to_csv(os.path.join(snapshotspath,sessiontime+'_boundingboxes.csv'), index=False)

#Salva logs vqa
session_vqa_logs_df.to_csv(os.path.join(snapshotspath,sessiontime+'_vqa.csv'), index=False)

# Libera el objeto de captura
vid.release()
if savevideo == 1 and result != 0:
    result.release()
# Destruye ventanas
cv2.destroyAllWindows()

