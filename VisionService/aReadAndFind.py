import multiprocessing
import time
import cv2
import sys
import shutil
import base64
import zlib
import os

from websocket import create_connection

host = 'ws://127.0.0.1:5620'

remoteUrl = 0 # "http://192.168.1.106:8081"
remoteUrl2 = 1 # "http://192.168.1.106:8082"
capture_local = False

if not capture_local:
  host = 'ws://192.168.1.106:5620'
  remoteUrl = "http://192.168.1.106:8081"
  remoteUrl2 = "http://192.168.1.106:8082"

ws = create_connection(host)
swimSocket = create_connection(host)

def writeImage(selectedEye, videoUrl, imageQueue):
  print('start write update loop')
  while True:
    jpg_as_text = imageQueue.get()
    message = "@command(node:\"/image/" + selectedEye +"\",lane:\"updateRawImage\"){\"" + jpg_as_text + "\"}"
    # print(message)
    ws.send(message)    
    time.sleep(1/10)

def readImage(selectedEye, videoUrl, imageQueue):

  frame_num = 0
  start_time = time.time()
  fps = 0
  videoFeed = None

  print("start reading cam for " + selectedEye + " @" + str(videoUrl))
  videoFeed = cv2.VideoCapture(videoUrl)

  if videoFeed != None:
    if not videoFeed.isOpened():
      raise IOError('Can\'t open webcam')

  print('start read update loop')
  while True:


    if face_cascade.empty():
        print('face cascade not found')

    if eye_cascade.empty():
        print('eye cascade not found')

    frame_info = '#:{0}, FPS:{1:.2f}'.format(frame_num, fps)
    ret, frame = videoFeed.read()
    if not ret:
      print('Can\'t read video data. Potential end of stream')
      return
    else:
      # height, width = frame.shape[:2]
      # # frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
      # frame = cv2.resize(frame, (width/1, height/1), interpolation = cv2.INTER_AREA)
      # cv2.putText(frame, frame_info, (10, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)
      # encoded, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 64])
      # zlib_text = zlib.compress(buffer)
      # jpg_as_text = base64.b64encode(zlib_text)
      # imageQueue.put(jpg_as_text)
      # message = "@command(node:\"/image/" + selectedEye +"\",lane:\"updateRawImage\"){\"" + jpg_as_text + "\"}"
      # ws.send(message)
      faces = face_cascade.detectMultiScale(frame, 1.3, 5)
      faceResult = []
      for (x,y,w,h) in faces:
          cv2.rectangle(frame,(x,y),(x+w,y+h),(255,0,0),2)
          roi_gray = frame[y:y+h, x:x+w]
          eyes = eye_cascade.detectMultiScale(roi_gray)
          currFace = {
              "width": w,
              "height": h,
              "x1": x,
              "y1": y,
              "x2": x+w,
              "y2": y+h,
              "eyes": []
          }
          eyeList = []
          for (ex,ey,ew,eh) in eyes:
              cv2.rectangle(roi_gray,(ex,ey),(ex+ew,ey+eh),(0,255,0),2)
              
              currFace['eyes'].append({
                  "width": ew,
                  "height": eh,
                  "x1": ex,
                  "y1": ey,
                  "x2": ex+w,
                  "y2": ey+h
              })

          faceResult.append(currFace)
  
      resultStr = str(faceResult)
      if selectedEye == "leftEye":
        message = "@command(node:\"/botState\",lane:\"setLeftEyeFaces\"){\"" + resultStr + "\"}"
        # print(message)
        swimSocket.send(message)         

        # cv2.imshow("Left Eye Face Detect", frame)
        # cv2.waitKey(1)  
      else:    
        message = "@command(node:\"/botState\",lane:\"setRightEyeFaces\"){\"" + resultStr + "\"}"
        # print(message)
        swimSocket.send(message)         

        # cv2.imshow("Right Eye Face Detect", frame)
        # cv2.waitKey(1)  


    # if frame_num % 120 == 0:
    # print("restart reading cam for " + selectedEye + " @" + str(videoUrl))
    videoFeed.release()
    videoFeed = cv2.VideoCapture(videoUrl)


    end_time = time.time()
    fps = fps * 0.9 + 1/(end_time - start_time) * 0.1
    start_time = end_time
    frame_num += 1
    time.sleep(1/30)
    


if __name__ == '__main__':
  print("starting main")
  try:
    leftEyeSocketUrl = "ws://192.168.1.106:8085"
    rightEyeSocketUrl = "ws://192.168.1.106:8086"

    left_image_queue = multiprocessing.Queue(1)
    right_image_queue = multiprocessing.Queue(1)

    data_path = os.path.dirname(os.path.abspath(__file__)) + '/data/'

    face_cascade = cv2.CascadeClassifier(data_path + 'haarcascades/haarcascade_frontalface_alt2.xml')
    eye_cascade = cv2.CascadeClassifier(data_path + 'haarcascades/haarcascade_eye.xml')

    left_image_queue = multiprocessing.Queue(1)
    right_image_queue = multiprocessing.Queue(1)

    left_eye_read_process = multiprocessing.Process(target=readImage,args=('leftEye', remoteUrl, left_image_queue,))
    left_eye_read_process.start()

    # left_eye_write_process = multiprocessing.Process(target=writeImage,args=('leftEye', remoteUrl, left_image_queue,))
    # left_eye_write_process.start()

    right_eye_read_process = multiprocessing.Process(target=readImage,args=('rightEye', remoteUrl2, right_image_queue,))
    right_eye_read_process.start()

    # right_eye_write_process = multiprocessing.Process(target=writeImage,args=('rightEye', remoteUrl, right_image_queue,))
    # right_eye_write_process.start()

    left_eye_read_process.join()
    # left_eye_write_process.join()
    right_eye_read_process.join()
    # right_eye_write_process.join()
  except IOError as err:
    print("IO error: {0}".format(err))
  except:
    print("Unknown Error:", sys.exc_info()[0])
    raise
  # finally:
  #   if videoFeed:
  #     if videoFeed.isOpened():
  #       videoFeed.release()
  #   # if videoFeed2 != None:
  #   #   if videoFeed2.isOpened():
  #   #     videoFeed2.release()
      
