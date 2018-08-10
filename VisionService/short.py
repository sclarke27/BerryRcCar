import multiprocessing
import cv2
import pafy
import tensorflow as tf
import time

from models import yolo
from utils.general import format_predictions, find_class_by_name, is_url

 
FLAGS = tf.flags.FLAGS
 
def cam_loop(raw_image_queue, processed_image_queue):
    # get video url from command line params
    video = FLAGS.video

    # setup video stream
    if is_url(video):
      videoPafy = pafy.new(video)
      video = videoPafy.getbestvideo(preftype="mp4").url

    # capture video stream
    cap = cv2.VideoCapture(video)

    while True:
        _ , img = cap.read()
        if img is not None:
            raw_image_queue.put(img)
 
def show_loop(raw_image_queue, processed_image_queue):
    # cv2.namedWindow('cam1')
    cv2.namedWindow('cam1-dect')
 
    while True:
        # raw = raw_image_queue.get()
        processed = processed_image_queue.get()
        # cv2.imshow('cam1', raw)
        cv2.imshow('cam1-dect', processed)
        cv2.waitKey(1)
 
def detect(raw_image_queue, processed_image_queue):
    source_h = 720
    source_w = 1280

    model_cls = find_class_by_name(FLAGS.model_name, [yolo])
    model = model_cls(input_shape=(source_h, source_w, 3))
    model.init()

    frame_num = 0
    start_time = time.time()
    fps = 0
 
    while True:
        frame = raw_image_queue.get()
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

        end_time = time.time()
        fps = fps * 0.9 + 1/(end_time - start_time) * 0.1
        start_time = end_time

        # Draw additional info
        frame_info = 'Frame: {0}, FPS: {1:.2f}'.format(frame_num, fps)
        cv2.putText(frame, frame_info, (10, frame.shape[0]-10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
        logger.info(frame_info)     
        processed_image_queue.put(frame)
        frame_num += 1


if __name__ == '__main__':
    tf.flags.DEFINE_string('video', 0, 'Path to the video file.')
    tf.flags.DEFINE_string('model_name', 'Yolo2Model', 'Model name to use.')
 
    logger = multiprocessing.log_to_stderr()
    logger.setLevel(multiprocessing.SUBDEBUG)
 
    raw_image_queue = multiprocessing.Queue(1)
    processed_image_queue = multiprocessing.Queue(1)
 
    cam_process = multiprocessing.Process(target=cam_loop,args=(raw_image_queue, processed_image_queue,))
    cam_process.start()
 
    show_process = multiprocessing.Process(target=show_loop,args=(raw_image_queue, processed_image_queue,))
    show_process.start()
 
    detect_process = multiprocessing.Process(target=detect,args=(raw_image_queue, processed_image_queue,))
    detect_process.start()

    cam_process.join()
    show_loop.join()
    detect_process.join()
    