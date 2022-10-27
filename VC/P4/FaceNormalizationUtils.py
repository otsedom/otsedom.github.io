# /****************************************************************************************
#   Utilities for getting face info from an image, adapted to python by Pedro Marín Reyes
#   Adapted to process webcam and predict
#   Modesto Castrillón Santana
#   January 2008-2018
# ****************************************************************************************/
import math
import numpy as np
import cv2

class Kind_wraping:
    HS = 'HS'
    FACE = 'FACE'


class Normalization:
    def __init__(self):
        self.norm_image = None
        self.dist_eyes = None
        self.angle_eyes = None

    def normalize_gray_img(self, grey_img, lex, ley, rex, rey, kind=Kind_wraping.HS):

        #print('IN ' + str(lex) + ' ' + str(ley) + '  ' + str(rex) + ' ' + str(rey) + '\n')
        [img_padding, lex, ley, rex, rey, distancia_entre_ojos] = Utils4Normalization.add_padding(grey_img, lex, ley,
                                                                                                  rex, rey)

        # rotation
        [angulo, inter_x, inter_y] = Utils4Normalization.get_angle_4_rotation(lex, ley, rex, rey)
        #print('IN ' + str(lex) + ' ' + str(ley) + '  ' + str(rex) + ' ' + str(rey) + '\n')
        #print('OUT ' + str(inter_x) + ' ' + str(inter_y) + '  ' + str(angulo) + '\n')
        gray_img_rot = Utils4Normalization.rotate_gray_image(img_padding, angulo, inter_x, inter_y)
        # //Transformamos segn las posiciones de los ojos tras rotar
        [oixr, oiyr] = Utils4Normalization.rotate_2d(inter_x, inter_y, -angulo, lex, ley)
        [odxr, odyr] = Utils4Normalization.rotate_2d(inter_x, inter_y, -angulo, rex, rey)

        c_warping_img = self.__obtain_warping_by_kind(kind)
        gray_img_norm = c_warping_img.normalize_by_eyes(gray_img_rot, oixr, oiyr, odxr, odyr)

        self.angle_eyes = angulo
        self.dist_eyes = distancia_entre_ojos
        self.norm_image = gray_img_norm

    @property
    def normf_image(self):
        return self.norm_image

    @property
    def distf_eyes(self):
        return self.dist_eyes

    @property
    def anglef_eyes(self):
        return self.angle_eyes

    def __obtain_warping_by_kind(self, kind):
        c_wraping_img = None
        if kind == 'HS':
            # //Escalamos segn la distancia ocular y segn la opción de normalización de la ilumicación escogida
            c_wraping_img = CWarpingImage([59 + 50 * 2, 65 + 45 * 2], [16 + 50, 17 + 45, 42 + 50,
                                                                       17 + 45])  # tamaño de la cara y posiciones de los ojos para HS
        if kind == 'FACE':
            # //Escalamos segn la distancia ocular y segn la opción de normalización de la ilumicación escogida
            c_wraping_img = CWarpingImage([59, 65 + 10], [16, 17 + 5, 42, 17 + 5])  # tamaño
        return c_wraping_img


class Utils4Normalization:
    def __init__(self):
        pass

    # //! Rotates a point
    # /*!
    # Rotates a point around a center of projection
    # \param cx x coordinate of the center of projection
    # \param cy y coordinate of the center of projection
    # \param angle Angle to rotate (in degrees)
    # \param x,  x coordinate
    # \param y,  y coordinate
    # */
    @staticmethod
    def rotate_2d(cx, cy, angle, x, y):
        rad_angle = -angle * 3.141592 / 180.0
        cos = math.cos(rad_angle)
        sin = math.sin(rad_angle)
        # desplazar punto al origen
        lx = x - cx
        ly = y - cy
        # rotar
        lx = cos * lx + sin * ly
        ly = cos * ly - sin * lx
        # retransladar
        return [lx + cx, ly + cy]

    @staticmethod
    def get_angle_4_rotation(lex, ley, rex, rey):
        inter_x = (rex + lex) / 2.
        inter_y = (rey + ley) / 2.
        angulo = math.atan2(inter_y - rey, rex - inter_x)  # angulo en radianes
        angulo = -angulo * 180. / 3.141592
        return [angulo, inter_x, inter_y]

    @staticmethod
    def add_padding(grey_img, lex, ley, rex, rey):
        [isy, isx] = grey_img.shape
        distancia_entre_ojos = math.sqrt(math.pow(rex - lex, 2) + math.pow(rey - ley, 2))
        x_padding = int(distancia_entre_ojos * 3)  # 3 -> proporcion por la que se decia el padding
        y_padding = int(distancia_entre_ojos * 3)
        #print(type(grey_img[0, 0]))
        img_padding = np.zeros(dtype=np.uint8, shape=(int(isy + y_padding * 2), int(isx + x_padding * 2)))
        #print(type(img_padding[0, 0]))
        img_padding[y_padding:y_padding + isy, x_padding:x_padding + isx] = grey_img
        # img_padding[y_padding:y_padding + isy, x_padding:x_padding + isx] = list(grey_img)
        #cv2.imshow("Debug", grey_img)
        #cv2.imshow("Debug2", img_padding)
        return [img_padding, lex + x_padding, ley + y_padding, rex + x_padding, rey + y_padding, distancia_entre_ojos]

    @staticmethod
    def rotate_gray_image(gray_img, angulo, x_pos, y_pos, bo_roi=None, rect=[0, 0, 0, 0]):
        if bo_roi is not None:
            gray_img = gray_img[rect[0]:rect[0] + rect[2] - rect[0] + 1, rect[1]:rect[3] - rect[1] + 1]
        if bo_roi is not None:
            rot_mat = cv2.getRotationMatrix2D((x_pos - rect[0], y_pos - rect[2]), angulo, 1.0)
        else:
            rot_mat = cv2.getRotationMatrix2D((x_pos, y_pos), angulo, 1.0)
        rows, cols = gray_img.shape
        # return cv2.warpAffine(gray_img, rot_mat, (cols, rows), cv.CV_INTER_LINEAR + cv.CV_WARP_FILL_OUTLIERS)
        return cv2.warpAffine(gray_img, rot_mat, (cols, rows), cv2.INTER_LINEAR + cv2.WARP_FILL_OUTLIERS)


class CWarpingImage:
    # cara->[SIZE_X,SIZE_Y]
    # ojos->[izq_x,izq_y, der_x,der_y]

    # selector __cara. Se usa para seleccionar el tamaño de la imagen normalizada
    SIZE_X = 0
    SIZE_Y = 1
    # selector __ojos. Se usa para seleccionar la posición de los ojos
    IZQ_X = 0
    IZQ_Y = 1
    DER_X = 2
    DER_Y = 3

    def __init__(self, cara, ojos):
        self.__cara = cara
        self.__ojos = ojos
        self.__pbElliptical_mask = np.empty([self.__cara[self.SIZE_X] * self.__cara[self.SIZE_Y]])

    def __elliptical_Mask(self, gray_img):
        sa = (self.__ojos[self.DER_X] - self.__ojos[self.IZQ_X]) * 1.15
        la = sa * 1.37
        sa *= sa
        la *= la
        incy = self.__ojos[self.DER_Y] + int((self.__ojos[self.DER_X] - self.__ojos[self.IZQ_X]) * 0.3)
        incx = (self.__ojos[self.DER_X] + self.__ojos[self.IZQ_X]) >> 1
        for i in range(0, self.__cara[self.SIZE_Y], 1):
            for j in range(0, self.__cara[self.SIZE_X], 1):
                py = i - incy
                px = j - incx
                fval = ((px * px) / sa) + ((py * py) / (la))
                if fval >= 1.:
                    gray_img[i, j] = 125
        return gray_img

    def normalize_by_eyes(self, gray_img, iOjoIX, iOjoIY, iOjoDX, iOjoDY, mascara_eliptica=False):
        [isy, isx] = gray_img.shape
        feyerate = (iOjoDX - iOjoIX) / (self.__ojos[self.DER_X] - self.__ojos[self.IZQ_X])

        sx = int(self.__cara[self.SIZE_X] * feyerate)
        sy = int(self.__cara[self.SIZE_Y] * feyerate)

        iox = int(iOjoIX - (self.__ojos[self.IZQ_X] * feyerate))
        ioy = int(iOjoIY - (self.__ojos[self.IZQ_Y] * feyerate))
        gray_img_recortada = gray_img[ioy:ioy + sy, iox:iox + sx]

        grey_img_resize = cv2.resize(gray_img_recortada, (self.__cara[self.SIZE_X], self.__cara[self.SIZE_Y]),
                                     interpolation=cv2.INTER_AREA)

        if mascara_eliptica:
            gray_img_resize_eliptica = self.__elliptical_Mask(grey_img_resize)
            return gray_img_resize_eliptica
        return grey_img_resize

