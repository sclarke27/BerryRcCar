# Copyright (C) 2017 DataArt
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.


import time
import cv2
import pafy
import tensorflow as tf

from models import yolo
from utils.general import format_predictions, find_class_by_name, is_url

FLAGS = tf.flags.FLAGS

def evaluate(_):
    win_name = 'left eye'
    win_name2 = 'right eye'
    cv2.namedWindow(win_name)
    cv2.namedWindow(win_name2)

    do_predictions = False
    frame_num = 0
    start_time = time.time()
    fps = 0
    source_h = 600
    source_w = 800

    if do_predictions:
      model_cls = find_class_by_name(FLAGS.model_name, [yolo])
      model = model_cls(input_shape=(source_h, source_w, 3))
      model.init()


    while True: 
      frame = cv2.imread('latest.png', cv2.IMREAD_COLOR)
      frame2 = cv2.imread('latest2.png', cv2.IMREAD_COLOR)

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

        if hasattr(frame2, "__len__"):                            
          predictions2 = model.evaluate(frame2)
          for o in predictions2:
              x1 = o['box']['left']
              x2 = o['box']['right']

              y1 = o['box']['top']
              y2 = o['box']['bottom']

              color = o['color']
              class_name = o['class_name']

              # Draw box
              cv2.rectangle(frame2, (x1, y1), (x2, y2), color, 2)

              # Draw label
              (test_width, text_height), baseline = cv2.getTextSize(
                  class_name, cv2.FONT_HERSHEY_SIMPLEX, 0.75, 1)
              cv2.rectangle(frame2, (x1, y1),
                            (x1+test_width, y1-text_height-baseline),
                            color, thickness=cv2.FILLED)
              cv2.putText(frame2, class_name, (x1, y1-baseline),
                          cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 0, 0), 1)      

      end_time = time.time()
      fps = fps * 0.9 + 1/(end_time - start_time) * 0.1
      start_time = end_time

      frame_info = 'Frame: {0}, FPS: {1:.2f}'.format(frame_num, fps)

      if hasattr(frame, "__len__"):
        cv2.putText(frame, frame_info, (10, frame.shape[0]-20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
        cv2.imshow(win_name, frame)

      #write image to window
      if hasattr(frame2, "__len__"):
        cv2.putText(frame2, frame_info, (10, frame2.shape[0]-20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
        cv2.imshow(win_name2, frame2)

      frame_num += 1
      frame = None
      frame2 = None

      k = cv2.waitKey(1)
      
      if k == 27:         # wait for ESC key to exit
          cv2.destroyAllWindows()
          break

if __name__ == '__main__':

  tf.flags.DEFINE_string('model_name', 'Yolo2Model', 'Model name to use.')
  tf.app.run(main=evaluate)
