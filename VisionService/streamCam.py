import base64
import cv2
import zmq
import time
import shutil

context = zmq.Context()
footage_socket = context.socket(zmq.PUB)
footage_socket.connect('tcp://192.168.1.106:8083')

camera = cv2.VideoCapture(0)  # init the camera
write_file = True


frame_num = 0
start_time = time.time()
fps = 0
frame_info = ""
while True:
    try:
        if frame_num % 120 == 0:
            camera.release()
            camera = cv2.VideoCapture(0) 

        grabbed, frame = camera.read()  # grab the current frame
        frame_info = 'Frame: {0}, CAP-FPS: {1:.2f}'.format(frame_num, fps)
        cv2.putText(frame, frame_info, (10, frame.shape[0]-40), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
        
        if write_file:
            cv2.imwrite('raw1.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 72])
            shutil.move('raw1.jpg', 'latest1.jpg')
        else:
            encoded, buffer = cv2.imencode('.jpg', frame)
            jpg_as_text = base64.b64encode(buffer)
            footage_socket.send(jpg_as_text)

        end_time = time.time()
        fps = fps * 0.9 + 1/(end_time - start_time) * 0.1
        start_time = end_time
        frame_num += 1

        # print('streaming...')

    except KeyboardInterrupt:
        camera.release()
        cv2.destroyAllWindows()
        break
