import numpy as np
import cv2
import pafy
import os
import sys
import time

from utils.general import is_url

def do_detection():
  win_name = 'face'
  find_faces = True
  find_eyes = False
  frame_num = 0
  start_time = time.time()
  fps = 0

  data_path = os.path.dirname(os.path.abspath(__file__)) + '/data/'

  face_cascade = cv2.CascadeClassifier(data_path + 'haarcascades/haarcascade_frontalface_default.xml')
  eye_cascade = cv2.CascadeClassifier(data_path + 'haarcascades/haarcascade_eye.xml')

  if face_cascade.empty():
    print('face cascade not found')
    return

  while True:

    leftEyeImg = cv2.imread('latest.png', cv2.IMREAD_COLOR)
    frame2 = cv2.imread('latest2.png', cv2.IMREAD_COLOR)

    if find_faces:
      gray = leftEyeImg # cv2.cvtColor(leftEyeImg, cv2.COLOR_BGR2GRAY)
      faces = face_cascade.detectMultiScale(gray, 1.3, 5)
      for (x,y,w,h) in faces:
          cv2.rectangle(leftEyeImg,(x,y),(x+w,y+h),(255,0,0),2)
          roi_gray = gray[y:y+h, x:x+w]
          roi_color = leftEyeImg[y:y+h, x:x+w]
          if find_eyes:
            eyes = eye_cascade.detectMultiScale(roi_gray)
            for (ex,ey,ew,eh) in eyes:
                cv2.rectangle(roi_color,(ex,ey),(ex+ew,ey+eh),(0,255,0),2)

    end_time = time.time()
    fps = fps * 0.9 + 1/(end_time - start_time) * 0.1
    start_time = end_time

    frame_info = 'Frame: {0}, FPS: {1:.2f}'.format(frame_num, fps)

    if hasattr(leftEyeImg, "__len__"):
      cv2.putText(leftEyeImg, frame_info, (10, leftEyeImg.shape[0]-20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
      cv2.imshow(win_name, leftEyeImg)
    # cv2.imshow('img',img)

    frame_num += 1
    leftEyeImg = None
    # frame2 = None

    key = cv2.waitKey(1)
    # Exit
    if key == 27:
      cv2.destroyAllWindows()
      break
    

if __name__ == '__main__':
  try:
    do_detection()
  except:
    print("Unknown Error:", sys.exc_info()[0])
    raise
    