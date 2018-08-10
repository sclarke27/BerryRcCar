import time
import cv2
import sys
import shutil

win_name = 'raw image'
videoUrl = "http://192.168.1.106:8081"
videoUrl2 = "http://192.168.1.106:8082"
videoFeed = None
videoFeed2 = None
capture_local = True

def readWriteImage():

  frame_num = 0
  start_time = time.time()
  fps = 0

  if capture_local:
    videoFeed = cv2.VideoCapture(0)
  else:
    videoFeed = cv2.VideoCapture(videoUrl)
    
  if videoFeed != None:
    if not videoFeed.isOpened():
      raise IOError('Can\'t open webcam')

  if capture_local:
    videoFeed2 = cv2.VideoCapture(1)
  else:
    videoFeed2 = cv2.VideoCapture(videoUrl2)

  if not videoFeed2.isOpened():
    raise IOError('Can\'t open webcam2')


  while True:

    frame_info = 'Frame: {0}, CAP-FPS: {1:.2f}'.format(frame_num, fps)
    ret, frame = videoFeed.read()
    if not ret:
      print('Can\'t read video data. Potential end of stream')
      return
    else:
      cv2.putText(frame, frame_info, (10, frame.shape[0]-40), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)
      cv2.imwrite('raw.png', frame, [cv2.IMWRITE_PNG_COMPRESSION, 9])
      shutil.move('raw.png', 'latest.png')
      # videoFeed.release()

    if videoFeed2 != None:
      ret2, frame2 = videoFeed2.read()
      if not ret2:
        print('Can\'t read video data. Potential end of stream')
        return
      else:
        cv2.putText(frame2, frame_info, (10, frame2.shape[0]-40), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)
        cv2.imwrite('raw2.png', frame2, [cv2.IMWRITE_PNG_COMPRESSION, 9])
        shutil.move('raw2.png', 'latest2.png')
        # videoFeed2.release()
    
    end_time = time.time()
    fps = fps * 0.9 + 1/(end_time - start_time) * 0.1
    start_time = end_time
    frame_num += 1


if __name__ == '__main__':

  try:
    readWriteImage()
  except IOError as err:
    print("IO error: {0}".format(err))
  except:
    print("Unknown Error:", sys.exc_info()[0])
    raise
  finally:
    if videoFeed != None:
      if videoFeed.isOpened():
        videoFeed.release()
    if videoFeed2 != None:
      if videoFeed2.isOpened():
        videoFeed2.release()
      
