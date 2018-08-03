import time
import threading

import cv2
import pafy
import tensorflow as tf

from models import yolo
from utils.general import format_predictions, find_class_by_name, is_url

# global FLAGS
# global frame_num
# global exitFlag
# global start_time
# global fps
# global frame
# global ret
global win_name
global videoWindow
global key 

FLAGS = tf.flags.FLAGS

class Detector:
  def __init__(self, name):
    self.name = name
    self.currentTick = 0
    self.vidThread = VideoThread(1, "vidThread", self.name)
    # self.detectThread = DetectionThread(2, "Thread-2")

  def start(self):
    cv2.namedWindow(self.name)
    print ("Starting threads")
    self.vidThread.start()
    # self.detectThread.start()
    self.vidThread.join()
    # self.detectThread.join()

  def tick(self):
    self.currentTick = self.currentTick + 1


class VideoThread(threading.Thread,):
  def __init__(self, threadID, name, winName):
    threading.Thread.__init__(self)
    print ("Starting " + name)
    self.threadID = threadID
    self.name = name
    self.winName = winName

  def run(self):
    print ("Running " + self.name)
    self.read_video_stream(FLAGS, self.winName)

  def read_video_stream(self, FLAGS, winName):
    video = FLAGS.video

    if is_url(video):
      videoPafy = pafy.new(video)
      video = videoPafy.getbest(preftype="mp4").url

    cam = cv2.VideoCapture(video)
    if not cam.isOpened():
      raise IOError('Can\'t open "{}"'.format(FLAGS.video))

    source_h = cam.get(cv2.CAP_PROP_FRAME_HEIGHT)
    source_w = cam.get(cv2.CAP_PROP_FRAME_WIDTH)

    try:
      while True:
        ret, frame = cam.read()
        if not ret:
            print('Can\'t read video data. Potential end of stream')
            # self.exit()
            return  

        cv2.imshow(winName, frame)      

    finally:
        cv2.destroyAllWindows()
        cam.release()

    # frame_num += 1

class DetectionThread(threading.Thread):
  def __init__(self, threadID, name):
    threading.Thread.__init__(self)
    self.threadID = threadID
    self.name = name
    print ("Starting " + self.name)
    # start_video_window()
  def run(self):
    print ("Running " + self.name)
    while True:
      self.do_detection()

  def start_detection(self):
    self.FLAGS = tf.flags.FLAGS
    self.model_cls = find_class_by_name(self.FLAGS.model_name, [yolo])
    self.model = model_cls(input_shape=(source_h, source_w, 3))
    self.model.init()


  def do_detection(self):
    predictions = self.model.evaluate(frame)

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

    end_time = time.time()
    fps = fps * 0.9 + 1/(end_time - start_time) * 0.1
    start_time = end_time

    # Draw additional info
    frame_info = 'Frame: {0}, FPS: {1:.2f}'.format(frame_num, fps)
    cv2.putText(frame, frame_info, (10, frame.shape[0]-10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
    # logger.info(frame_info)

    cv2.imshow(win_name, frame)

def run_detection(_):
  # Create new threads
  dector1 = Detector('cam1')
  dector1.start()

  while True:
    dector1.tick()
  print ("Exiting Main Thread")

if __name__ == '__main__':
  tf.flags.DEFINE_string('video', 0, 'Path to the video file.')
  tf.flags.DEFINE_string('model_name', 'Yolo2Model', 'Model name to use.')

  tf.app.run(main=run_detection)
