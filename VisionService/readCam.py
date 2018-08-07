import time
import cv2
import sys

win_name = 'raw image'
videoFeed = None

def readWriteImage():
  videoFeed = cv2.VideoCapture(0)
  if videoFeed != None:
    if not videoFeed.isOpened():
      raise IOError('Can\'t open webcam')

  ret, frame = videoFeed.read()
  if not ret:
    print('Can\'t read video data. Potential end of stream')
    return
  else:
    cv2.imshow(win_name, frame)

if __name__ == '__main__':
  cv2.namedWindow(win_name)

  try:
    while True:
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
