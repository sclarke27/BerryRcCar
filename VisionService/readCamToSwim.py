import multiprocessing
import time
import cv2
import sys
import shutil
import base64
import zlib

from websocket import create_connection

host = 'ws://192.168.1.106:5620'
ws = create_connection(host)

remoteUrl = 0 # "http://192.168.1.106:8081"
remoteUrl2 = 1 # "http://192.168.1.106:8082"
capture_local = False

if not capture_local:
  host = 'ws://192.168.1.106:5620'
  remoteUrl = "http://192.168.1.106:8081"
  remoteUrl2 = "http://192.168.1.106:8082"

def writeImage(selectedEye, videoUrl, imageQueue):
  print('start write update loop')
  while True:
    jpg_as_text = imageQueue.get()
    message = "@command(node:\"/image/" + selectedEye +"\",lane:\"updateRawImage\"){\"" + jpg_as_text + "\"}"
    # print(message)
    ws.send(message)    

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

    frame_info = '#:{0}, FPS:{1:.2f}'.format(frame_num, fps)
    ret, frame = videoFeed.read()
    if not ret:
      print('Can\'t read video data. Potential end of stream')
      return
    else:
      height, width = frame.shape[:2]
      # frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
      frame = cv2.resize(frame, (width/1, height/1), interpolation = cv2.INTER_AREA)
      cv2.putText(frame, frame_info, (10, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)
      encoded, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 10])
      zlib_text = zlib.compress(buffer)
      jpg_as_text = base64.b64encode(zlib_text)
      imageQueue.put(jpg_as_text)
      # message = "@command(node:\"/image/" + selectedEye +"\",lane:\"updateRawImage\"){\"" + jpg_as_text + "\"}"
      # ws.send(message)

    
    end_time = time.time()
    fps = fps * 0.9 + 1/(end_time - start_time) * 0.1
    start_time = end_time
    frame_num += 1
    


if __name__ == '__main__':
  print("starting main")
  try:
    left_image_queue = multiprocessing.Queue(1)
    right_image_queue = multiprocessing.Queue(1)

    left_eye_read_process = multiprocessing.Process(target=readImage,args=('leftEye', remoteUrl, left_image_queue,))
    left_eye_read_process.start()

    left_eye_write_process = multiprocessing.Process(target=writeImage,args=('leftEye', remoteUrl, left_image_queue,))
    left_eye_write_process.start()

    right_eye_read_process = multiprocessing.Process(target=readImage,args=('rightEye', remoteUrl2, right_image_queue,))
    right_eye_read_process.start()

    right_eye_write_process = multiprocessing.Process(target=writeImage,args=('rightEye', remoteUrl, right_image_queue,))
    right_eye_write_process.start()

    left_eye_read_process.join()
    left_eye_write_process.join()
    right_eye_read_process.join()
    right_eye_write_process.join()
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
      
