import cv2  # OpenCV Library
import numpy as np
import math


def __list2colmatrix(pts_list):
    """
        convert list to column matrix
    Parameters:
    ----------
        pts_list:
            input list
    Retures:
    -------
        colMat:

    """
    assert len(pts_list) > 0
    colMat = []
    for i in range(len(pts_list)):
        colMat.append(pts_list[i][0])
        colMat.append(pts_list[i][1])
    colMat = np.matrix(colMat).transpose()
    return colMat


def __find_tfrom_between_shapes(from_shape, to_shape):
    """
        find transform between shapes
    Parameters:
    ----------
        from_shape:
        to_shape:
    Retures:
    -------
        tran_m:
        tran_b:
    """
    assert from_shape.shape[0] == to_shape.shape[0] and from_shape.shape[0] % 2 == 0

    sigma_from = 0.0
    sigma_to = 0.0
    cov = np.matrix([[0.0, 0.0], [0.0, 0.0]])

    # compute the mean and cov
    from_shape_points = from_shape.reshape(int(from_shape.shape[0] / 2), 2)
    to_shape_points = to_shape.reshape(int(to_shape.shape[0] / 2), 2)
    mean_from = from_shape_points.mean(axis=0)
    mean_to = to_shape_points.mean(axis=0)

    for i in range(from_shape_points.shape[0]):
        temp_dis = np.linalg.norm(from_shape_points[i] - mean_from)
        sigma_from += temp_dis * temp_dis
        temp_dis = np.linalg.norm(to_shape_points[i] - mean_to)
        sigma_to += temp_dis * temp_dis
        cov += (to_shape_points[i].transpose() - mean_to.transpose()) * (from_shape_points[i] - mean_from)

    sigma_from = sigma_from / to_shape_points.shape[0]
    sigma_to = sigma_to / to_shape_points.shape[0]
    cov = cov / to_shape_points.shape[0]

    # compute the affine matrix
    s = np.matrix([[1.0, 0.0], [0.0, 1.0]])
    u, d, vt = np.linalg.svd(cov)

    if np.linalg.det(cov) < 0:
        if d[1] < d[0]:
            s[1, 1] = -1
        else:
            s[0, 0] = -1
    r = u * s * vt
    c = 1.0
    if sigma_from != 0:
        c = 1.0 / sigma_from * np.trace(np.diag(d) * s)

    tran_b = mean_to.transpose() - c * r * mean_from.transpose()
    tran_m = c * r

    return tran_m, tran_b


def CropDetection(img, points, desired_size=256, padding=0):

    crop_imgs = []
    p = points
    #for p in points:
    print(p)
    shape = []
    for k in range(int(len(p) / 2)):
        shape.append(p[k])
        # shape.append(p[k + 5])
        shape.append(p[k + 2])

    if padding > 0:
        padding = padding
    else:
        padding = 0
    # average positions of face points
    mean_face_shape_x = [0.224152, 0.75610125]  # , 0.490127, 0.254149, 0.726104]
    mean_face_shape_y = [0.2119465, 0.2119465]  # , 0.628106, 0.780233, 0.780233]

    from_points = []
    to_points = []

    for i in range(int(len(shape) / 2)):
        x = (padding + mean_face_shape_x[i]) / (2 * padding + 1) * desired_size
        y = (padding + mean_face_shape_y[i]) / (2 * padding + 1) * desired_size
        to_points.append([x, y])
        from_points.append([shape[2 * i], shape[2 * i + 1]])

    # convert the points to Mat
    from_mat = __list2colmatrix(from_points)
    to_mat = __list2colmatrix(to_points)

    # compute the similar transfrom
    tran_m, tran_b = __find_tfrom_between_shapes(from_mat, to_mat)

    probe_vec = np.matrix([1.0, 0.0]).transpose()
    probe_vec = tran_m * probe_vec

    scale = np.linalg.norm(probe_vec)
    angle = 180.0 / math.pi * math.atan2(probe_vec[1, 0], probe_vec[0, 0])

    from_center = [(shape[0] + shape[2]) / 2.0, (shape[1] + shape[3]) / 2.0]
    to_center = [0, 0]
    to_center[1] = desired_size * 0.4
    to_center[0] = desired_size * 0.5

    ex = to_center[0] - from_center[0]
    ey = to_center[1] - from_center[1]

    rot_mat = cv2.getRotationMatrix2D((from_center[0], from_center[1]), -1 * angle, scale)
    rot_mat[0][2] += ex
    rot_mat[1][2] += ey

    chips = cv2.warpAffine(img, rot_mat, (desired_size, desired_size))
    #crop_imgs.append(chips)

    return chips


def getLargest(objects):
    if len(objects) < 1:
        return -1
    elif len(objects) == 1:
        return 0
    else:
        areas = [w * h for x, y, w, h in objects]
        return np.argmax(areas)


def DetectLargestFaceandNormalize(img,Fc,LEc,REc):

    # Detect faces in input image
    faces = Fc.detectMultiScale(
        img,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(30, 30),
        flags=cv2.CASCADE_SCALE_IMAGE
    )

    iface = getLargest(faces)
    if iface < 0:
        cv2.imshow('Detection', img)
        return []

    # Draw largest face container
    (fx, fy, fw, fh) = faces[iface]
    cv2.rectangle(img, (fx,fy),(fx+fw,fy+fh), (255, 0, 0), 2)

    # Left eye in the upper-left area of the face
    offy1 = fy + (int)(fh * 0.15)
    offy2 = fy + (int)(fh / 2)
    offx1LE = fx
    offx2LE = fx + (int)(fw * 0.6)
    roi1 = img[offy1:offy2, offx1LE:offx2LE]
    LE = LEc.detectMultiScale(roi1)
    iLE = getLargest(LE)

    # Right eye n the upper-right area of the face
    offx1RE = fx + (int)(fw * 0.4)
    offx2RE = fx + fw
    roi2 = img[offy1:offy2,offx1RE:offx2RE]
    RE = REc.detectMultiScale(roi2)
    iRE = getLargest(RE)

    # Drwas eyes
    if iLE > -1:
        (x, y, w, h) = LE[iLE]
        cv2.rectangle(roi1, (x, y), (x + w, y + h), (0, 255, 0), 2)
        LEx = x + (int)(w/2)
        LEy = y + (int)(h/2)

    if iRE > -1:
        (x, y, w, h) = RE[iRE]
        cv2.rectangle(roi2, (x, y), (x + w, y + h), (0, 0, 255), 2)
        REx = x + (int)(w / 2)
        REy = y + (int)(h / 2)



    if iLE > -1 and iRE > -1:
        points = [offx1LE + LEx,offx1RE +  REx, offy1 + LEy, offy1 + REy]
        cv2.circle(img, (offx1LE + LEx, offy1 + LEy), 3, (0, 255, 0), 2)
        cv2.circle(img, (offx1RE + REx, offy1 + REy), 3, (0, 0, 255), 2)

        cv2.imshow('Detection', img)
        detcrop = CropDetection(img, points, desired_size=256, padding=0)
        cv2.imshow('NOrmDetection', detcrop)
        return detcrop
    else:
        cv2.imshow('Detection', img)
        return []

    #    # Searching the left eye
    #
    #
    #    # Detect a nose within the region bounded by each face (the ROI)
    #
    #
    #    for (nx, ny, nw, nh) in LE:
    #        # Un-comment the next line for debug (draw box around the left eye)
    #        cv2.rectangle(roi_color, (nx, ny), (nx + nw, ny + nh), (0, 255, 0), 2)
    #
    #    # Searching the right eye in the upper-left area of the face
    #    roi_gray = gray[y + (int)(h * 0.15):y + (int)(h / 2), x + (int)(w * 0.4):x + w]
    #    roi_color = frame[y + (int)(h * 0.15):y + (int)(h / 2), x + (int)(w * 0.4):x + w]
    #
    #    # Detect a nose within the region bounded by each face (the ROI)
    #    RE = lefteyeCascade.detectMultiScale(roi_gray)
    #
    #    for (nx, ny, nw, nh) in RE:
    #        # Un-comment the next line for debug (draw box around the right eye)
    #        cv2.rectangle(roi_color, (nx, ny), (nx + nw, ny + nh), (0, 0, 255), 2)
    #
    #    break


# ---------------------------------------------------------------------------------------------------------
#       Load and configure Haar Cascade Classifiers, searching nses only inside face containers
# ---------------------------------------------------------------------------------------------------------

# location of OpenCV Haar Cascade Classifiers:
baseCascadePath = './Cascades/'

# xml files describing our haar cascade classifiers
# Default opencv face detector
faceCascadeFilePath = baseCascadePath + 'haarcascade_frontalface_default.xml'
# HAAR
lefteyeCascadeFilePath = baseCascadePath + 'haarcascade_mcs_lefteye.xml'
righteyeCascadeFilePath = baseCascadePath + 'haarcascade_mcs_righteye.xml'
# LBP
lefteyeCascadeFilePath = baseCascadePath + 'classifierLE_LBP/cascade.xml'
righteyeCascadeFilePath = baseCascadePath + 'classifierRE_LBP/cascade.xml'


# build our cv2 Cascade Classifiers
faceCascade = cv2.CascadeClassifier(faceCascadeFilePath)
lefteyeCascade = cv2.CascadeClassifier(lefteyeCascadeFilePath)
righteyeCascade = cv2.CascadeClassifier(righteyeCascadeFilePath)

# -----------------------------------------------------------------------------
#       Main program loop
# -----------------------------------------------------------------------------

# collect video input from first webcam on system
video_capture = cv2.VideoCapture(0)

while video_capture.isOpened():
    # Capture video feed
    ret, frame = video_capture.read()

    imgcropped = DetectLargestFaceandNormalize(frame,faceCascade,lefteyeCascade,righteyeCascade)

    if imgcropped is None:
        print("No face!")


    # Display the resulting frame
    #cv2.imshow('Video', frame)

    # press any key to exit
    # NOTE;  x86 systems may need to remove: &amp;amp;amp;amp;amp;amp;quot;&amp;amp;amp;amp;amp;amp;amp; 0xFF == ord('q')&amp;amp;amp;amp;amp;amp;quot;
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# When everything is done, release the capture
video_capture.release()
cv2.destroyAllWindows()