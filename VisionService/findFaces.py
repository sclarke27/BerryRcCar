import numpy as np
import cv2 as cv
import pafy
from utils.general import is_url

data_path = '/mnt/d/BerryRcCar/VisionService/data/haarcascades/'
face_cascade = cv.CascadeClassifier(data_path + 'haarcascade_frontalface_default.xml')
eye_cascade = cv.CascadeClassifier(data_path + 'haarcascade_eye.xml')


video_url = "http://192.168.0.172:8081"

if is_url(video_url):
  videoPafy = pafy.new()
  video = videoPafy.getbest(preftype="mp4").url

  cam = cv2.VideoCapture(video)
  if not cam.isOpened():
      raise IOError('Can\'t open "{}"'.format(FLAGS.video))
      
  # img = cv.imread('faces.jpg')
  # gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)

  if face_cascade.empty():
    print('face cascade not found')
  else:
    while True:
      ret, img = cam.read()
      gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
      if not ret:
          print('Can\'t read video data. Potential end of stream')
          break
      faces = face_cascade.detectMultiScale(gray, 1.3, 5)
      for (x,y,w,h) in faces:
          cv.rectangle(img,(x,y),(x+w,y+h),(255,0,0),2)
          roi_gray = gray[y:y+h, x:x+w]
          roi_color = img[y:y+h, x:x+w]
          eyes = eye_cascade.detectMultiScale(roi_gray)
          for (ex,ey,ew,eh) in eyes:
              cv.rectangle(roi_color,(ex,ey),(ex+ew,ey+eh),(0,255,0),2)

      cv.imshow('img',img)
      cv.waitKey(0)
      # Exit
      if key == ord('q'):
        cv.destroyAllWindows()
  
else:
  print('not a url:' + video_url)
