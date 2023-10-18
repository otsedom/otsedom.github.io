import cv2
from imutils import face_utils
import numpy as np
import dlib
#MTCNN
from mtcnn.mtcnn import MTCNN

class FaceDetector:
    def __init__(self):

        self.FaceDetectors = ['VJ', 'DLIB', 'DNN', 'MTCNN']
        self.EyeDetectors = ['DLIB5', 'DLIB68']

        # DDN for face detection
        faceProto = "opencv_face_detector.pbtxt"
        faceModel = "opencv_face_detector_uint8.pb"
        self.faceNet = cv2.dnn.readNet(faceModel, faceProto)
        self.conf_threshold = 0.7

        # dlib hog+svm for face detection
        self.detectordlib = dlib.get_frontal_face_detector()

        # dlib facial landmarks
        p = "shape_predictor_5_face_landmarks.dat"
        self.predictor = dlib.shape_predictor(p)
        p = "shape_predictor_68_face_landmarks.dat"
        self.predictor68 = dlib.shape_predictor(p)

        #MTCNN face detcetor
        self.detectormtcnn = MTCNN()

        # Detcetores VJ
        # location of OpenCV Haar Cascade Classifiers:
        baseCascadePath = './ViolaJonesCascades/Cascades/'
        # Default opencv face detector
        faceCascadeFilePath = baseCascadePath + 'haarcascade_frontalface_default.xml'
        # HAAR
        lefteyeCascadeFilePath = baseCascadePath + 'haarcascade_mcs_lefteye.xml'
        righteyeCascadeFilePath = baseCascadePath + 'haarcascade_mcs_righteye.xml'
        # LBP
        #lefteyeCascadeFilePath = baseCascadePath + 'classifierLE_LBP/cascade.xml'
        #righteyeCascadeFilePath = baseCascadePath + 'classifierRE_LBP/cascade.xml'


        # build our cv2 Cascade Classifiers
        self.faceCascade = cv2.CascadeClassifier(faceCascadeFilePath)
        self.lefteyeCascade = cv2.CascadeClassifier(lefteyeCascadeFilePath)
        self.righteyeCascade = cv2.CascadeClassifier(righteyeCascadeFilePath)


    def getLargest(self, objects):
        if len(objects) < 1:
            return -1
        elif len(objects) == 1:
            return 0
        else:
            areas = [w * h for x, y, w, h in objects]
            return np.argmax(areas)

    def getLargestRect(self, objects):
        if len(objects) < 1:
            return -1
        elif len(objects) == 1:
            return 0
        else:
            areas = [(rect.right() - rect.left()) * (rect.bottom() - rect.top()) for (i, rect) in enumerate(objects)]
            return np.argmax(areas)

    def getLargestMTCNNBB(self, objects):
        if len(objects) < 1:
            return -1
        elif len(objects) == 1:
            return 0
        else:
            areas = [ (det['box'][2]*det['box'][3]) for det in objects ]
            return np.argmax(areas)


    def DetectLargestFaceEyesVJ(self, img):

        #Default, no detection
        fx = -1
        fy = -1
        fw = -1
        fh = -1
        LEx = -1
        LEy = -1
        REx = -1
        REy = -1



        # Detect faces in input image
        faces = self.faceCascade.detectMultiScale(
            img,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30),
            flags=cv2.CASCADE_SCALE_IMAGE
        )

        iface = self.getLargest(faces)
        if iface < 0:
            #cv2.imshow('Detection', img)
            return [fx, fy, fw, fh], [LEx, LEy, REx, REy]

        # Lrgest face container
        (fx, fy, fw, fh) = faces[iface]
        #cv2.rectangle(img, (fx,fy),(fx+fw,fy+fh), (255, 0, 0), 2)

        # Left eye in the upper-left area of the face
        offy1 = fy + (int)(fh * 0.15)
        offy2 = fy + (int)(fh / 2)
        offx1LE = fx
        offx2LE = fx + (int)(fw * 0.6)
        roi1 = img[offy1:offy2, offx1LE:offx2LE]
        LE = self.lefteyeCascade.detectMultiScale(roi1)
        iLE = self.getLargest(LE)

        # Right eye n the upper-right area of the face
        offx1RE = fx + (int)(fw * 0.4)
        offx2RE = fx + fw
        roi2 = img[offy1:offy2,offx1RE:offx2RE]
        RE = self.righteyeCascade.detectMultiScale(roi2)
        iRE = self.getLargest(RE)

        # Eye centers
        if iLE > -1:
            (x, y, w, h) = LE[iLE]
            #cv2.rectangle(roi1, (x, y), (x + w, y + h), (0, 255, 0), 2)
            LEx = x + (int)(w/2)
            LEy = y + (int)(h/2)

        if iRE > -1:
            (x, y, w, h) = RE[iRE]
            #cv2.rectangle(roi2, (x, y), (x + w, y + h), (0, 0, 255), 2)
            REx = x + (int)(w / 2)
            REy = y + (int)(h / 2)

        return [fx, fy, fw, fh], [offx1LE + LEx, offy1 + LEy, offx1RE +  REx, offy1 + REy]


    def DetectLargestFaceEyesDLIB(self, img,eyesdet):

        faces = self.detectordlib(img, 0)

        # Makes us of the largest face
        iface = self.getLargestRect(faces)
        if iface >= 0:
            x = faces[iface].left()
            y = faces[iface].top()
            w = faces[iface].right() - faces[iface].left()
            h = faces[iface].bottom() - faces[iface].top()

            if eyesdet == 'DLIB5':
                values = self.GetFacialLandmarks(img, faces[iface])

                if values is not None:
                    points, shape = values

                    # right eye n the image positions 0 ans 1 (left 2 and 3)
                    re = np.mean(shape[0:2], 0)
                    le = np.mean(shape[2:4], 0)

                    return [x, y, w, h], [le[0], le[1], re[0], re[1]], shape

                else:
                    return [-1, -1, -1, -1], [], []

            elif eyesdet == 'DLIB68':
                values = self.GetFacialLandmarks(img, faces[iface], 1)

                if values is not None:
                    points, shape = values

                    # average of coordinates around the eyes
                    le = np.mean(shape[36:42], 0)
                    re = np.mean(shape[42:48], 0)

                    return [x, y, w, h], [le[0], le[1], re[0], re[1]], shape
                else:
                    return [-1, -1, -1, -1], [], []

            else:
                return [-1, -1, -1, -1], [], []

        else:
            return [-1, -1, -1, -1], [], []


    def DetectLargestFaceEyesDNN(self, img,eyesdet):
        # Face detection DNN
        faces = self.FaceDetectionDNN(img)

        # Makes us of the largest face
        iface = self.getLargest(faces)
        if iface >= 0:
            (x, y, w, h) = faces[iface]
            # Composes rectangle
            face = dlib.rectangle(left=x, top=y, right=x + w, bottom=y + h)

            if eyesdet == 'DLIB5':
                values = self.GetFacialLandmarks(img, face)

                if values is not None:
                    points, shape = values

                    # right eye n the image positions 0 ans 1 (left 2 and 3)
                    re = np.mean(shape[0:2], 0)
                    le = np.mean(shape[2:4], 0)

                    return [x, y, w, h], [le[0], le[1], re[0], re[1]], shape

                else:
                    return [-1, -1, -1, -1], [], []

            elif eyesdet == 'DLIB68':
                values = self.GetFacialLandmarks(img, face, 1)

                if values is not None:
                    points, shape = values

                    le = np.mean(shape[36:42], 0)
                    re = np.mean(shape[42:48], 0)

                    return [x, y, w, h], [le[0], le[1], re[0], re[1]], shape
                else:
                    return [-1, -1, -1, -1], [], []

            else:
                return [-1, -1, -1, -1], [], []

        else:
            return [-1, -1, -1, -1], [], []


    def FaceDetectionDNN(self, img):

        # Detecta objetos
        frameHeight = img.shape[0]
        frameWidth = img.shape[1]
        blob = cv2.dnn.blobFromImage(img, 1.0, (300, 300), [104, 117, 123], True, False)

        self.faceNet.setInput(blob)
        detections = self.faceNet.forward()
        faces = []
        for i in range(detections.shape[2]):
            confidence = detections[0, 0, i, 2]
            if confidence > self.conf_threshold:
                x1 = int(detections[0, 0, i, 3] * frameWidth)
                y1 = int(detections[0, 0, i, 4] * frameHeight)
                x2 = int(detections[0, 0, i, 5] * frameWidth)
                y2 = int(detections[0, 0, i, 6] * frameHeight)
                faces.append([x1, y1, x2 - x1, y2 - y1])

        return faces


    def GetFacialLandmarks(self, img,roi,model=0):

        if model == 0:
            points = self.predictor(img, roi)
        else:
            points = self.predictor68(img, roi)

        if points is not None:
            # ibujamos recuadro mayor
            shape = face_utils.shape_to_np(points)
            # for (x, y) in shape:
            #     cv2.circle(imagenRGB, (x, y), 2, (255, 255, 255), -1)

            left_eye_x = int(points.part(3).x - abs(points.part(3).x - points.part(2).x) / 2.)
            left_eye_y = int(points.part(3).y - abs(points.part(3).y - points.part(2).y) / 2.)
            right_eye_x = int(points.part(1).x + abs(points.part(1).x - points.part(0).x) / 2.)
            right_eye_y = int(points.part(1).y - abs(points.part(1).y - points.part(0).y) / 2.)

            nose_x = int(points.part(4).x)
            nose_y = int(points.part(4).y)

            if right_eye_x - left_eye_x == 0:
                return None
            m1 = (right_eye_y - left_eye_y) / (right_eye_x - left_eye_x)
            if m1 != 0:
                m2 = -1 / m1
                b2 = nose_y - m2 * nose_x
                x_c = ((nose_y + 1.5 * abs(points.part(3).x - points.part(2).x) / 2.) - b2) / m2
                y_c = m2 * x_c + b2

                b3 = y_c - m1 * x_c
                left_mouth_x = ((y_c + m1 * 2 * abs(points.part(3).x - points.part(2).x) / 2.) - b3) / m1
                left_mouth_y = m1 * left_mouth_x + b3
                right_mouth_x = ((y_c - m1 * 2 * abs(points.part(3).x - points.part(2).x) / 2.) - b3) / m1
                right_mouth_y = m1 * right_mouth_x + b3
            else:
                left_mouth_x = points.part(4).x + 1.5 * abs(points.part(3).x - points.part(2).x) / 2.
                left_mouth_y = nose_y + abs(points.part(3).x - points.part(2).x) / 2.
                right_mouth_x = (points.part(4).x) - 1.5 * abs(points.part(3).x - points.part(2).x) / 2.
                right_mouth_y = nose_y + abs(points.part(3).x - points.part(2).x) / 2.

            points = [left_eye_x, right_eye_x, nose_x, left_mouth_x, right_mouth_x, left_eye_y, right_eye_y, nose_y,
                      left_mouth_y, right_mouth_y]


            return [points], shape
        else:
            return None


    def DetectLargestFaceEyesMTCNN(self, img):

        results = self.detectormtcnn.detect_faces(img)

        if not results is None:
            index = self.getLargestMTCNNBB(results)

            if len(results) < 1:
                return None

            # laergest face
            face_info = results[index]

            #print(face_info)

            [x, y, w, h] = face_info['box']
            le = face_info['keypoints']['left_eye']
            re = face_info['keypoints']['right_eye']

            return [x,y,w,h], [le[0], le[1], re[0], re[1]], [face_info['keypoints']['left_eye'], face_info['keypoints']['right_eye'],
                      face_info['keypoints']['nose'], face_info['keypoints']['mouth_left'],
                      face_info['keypoints']['mouth_right']]
        else:
            return None


    def SingleFaceEyesDetection(self, img,facedet,eyesdet):

        if facedet == 'VJ':# and eyesdet == 'VJ':
            face,eyes = self.DetectLargestFaceEyesVJ(img)

            return face, eyes, []

        elif facedet == 'DLIB':
            face, eyes, shape = self.DetectLargestFaceEyesDLIB(img,eyesdet)

            return face, eyes, shape


        elif facedet == 'DNN':
            face, eyes, shape = self.DetectLargestFaceEyesDNN(img,eyesdet)

            return face, eyes, shape

        elif facedet == 'MTCNN':
            values = self.DetectLargestFaceEyesMTCNN(img)

            if values is not None:
                face, eyes, shape = values

                return face, eyes, shape
            else:
                return None

