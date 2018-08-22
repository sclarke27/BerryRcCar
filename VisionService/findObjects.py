import multiprocessing
import time
import cv2
import sys
import shutil
import base64
import zlib
import os
import tensorflow as tf

from models import yolo
from utils.general import format_predictions, find_class_by_name, is_url

from websocket import create_connection

host = 'ws://127.0.0.1:5620'

remoteUrl = 0 # "http://192.168.1.106:8081"
remoteUrl2 = 1 # "http://192.168.1.106:8082"
capture_local = False
do_predictions = True
source_h = 480
source_w = 640  

FLAGS = tf.flags.FLAGS

if not capture_local:
  host = 'ws://192.168.1.106:5620'
  remoteUrl = "http://192.168.1.106:8081"
  remoteUrl2 = "http://192.168.1.106:8082"

ws = create_connection(host)
swimSocket = create_connection(host)

def readImage(selectedEye, videoUrl, imageQueue):

  frame_num = 0
  start_time = time.time()
  fps = 0
  videoFeed = None

  if do_predictions:
    model_cls = find_class_by_name('Yolo2Model', [yolo])
    print(model_cls)
    model = model_cls(input_shape=(source_h, source_w, 3))
    model.init()  

  print("start reading cam for " + selectedEye + " @" + str(videoUrl))
  videoFeed = cv2.VideoCapture(videoUrl)

  if videoFeed != None:
    if not videoFeed.isOpened():
      raise IOError('Can\'t open webcam')

  print('start read update loop')
  while True:

    frame_info = '#:{0}, FPS:{1:.2f}'.format(frame_num, fps)
    ret, frame = videoFeed.read()
    if not ret:
      print('Can\'t read video data. Potential end of stream')
      return
    else:

      if do_predictions:
        if hasattr(frame, "__len__"):
          predictions = model.evaluate(frame)
          for o in predictions:
              x1 = o['box']['left']
              x2 = o['box']['right']

              y1 = o['box']['top']
              y2 = o['box']['bottom']

              color = o['color']
              class_name = o['class_name']

              # Draw box
              cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)

              # Draw label
              (test_width, text_height), baseline = cv2.getTextSize(
                  class_name, cv2.FONT_HERSHEY_SIMPLEX, 0.75, 1)
              cv2.rectangle(frame, (x1, y1),
                            (x1+test_width, y1-text_height-baseline),
                            color, thickness=cv2.FILLED)
              cv2.putText(frame, class_name, (x1, y1-baseline),
                          cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 0, 0), 1)   

      if selectedEye == "leftEye":
        # message = "@command(node:\"/botState\",lane:\"setLeftEyeFaces\"){\"" + resultStr + "\"}"
        # # print(message)
        # swimSocket.send(message)         

        cv2.imshow("Left Eye Face Detect", frame)
        cv2.waitKey(1)  
      else:    
        # message = "@command(node:\"/botState\",lane:\"setRightEyeFaces\"){\"" + resultStr + "\"}"
        # # print(message)
        # swimSocket.send(message)         

        cv2.imshow("Right Eye Face Detect", frame)
        cv2.waitKey(1)  


    # if frame_num % 240 == 0:
      # print("restart reading cam for " + selectedEye + " @" + str(videoUrl))
    videoFeed.release()
    videoFeed = cv2.VideoCapture(videoUrl)


    end_time = time.time()
    fps = fps * 0.9 + 1/(end_time - start_time) * 0.1
    start_time = end_time
    frame_num += 1
    time.sleep(1/5)
    
def start(_):
  try:
    leftEyeSocketUrl = "ws://192.168.1.106:8085"
    rightEyeSocketUrl = "ws://192.168.1.106:8086"

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
      
if __name__ == '__main__':
  print("starting main")
  tf.flags.DEFINE_string('model_name', 'Yolo2Model', 'Model name to use.')
  tf.app.run(main=start)
