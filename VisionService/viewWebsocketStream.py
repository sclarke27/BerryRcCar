import multiprocessing
import cv2
import base64
import numpy as np
import websocket
import sys
import zlib

def on_message(ws, message):
    # print message
    try:
        frame = message
        img = base64.b64decode(frame)
        img = zlib.decompress(img)
        npimg = np.fromstring(img, dtype=np.uint8)
        source = cv2.imdecode(npimg, 1)
        cv2.imshow("Left Eye", source)
        cv2.waitKey(1)
    except:
        print("Unknown Error:", sys.exc_info()[0])
        raise    

def on_message2(ws, message):
    # print message
    try:
        frame = message
        img = base64.b64decode(frame)
        img = zlib.decompress(img)
        npimg = np.fromstring(img, dtype=np.uint8)
        source = cv2.imdecode(npimg, 1)
        cv2.imshow("Right Eye", source)
        cv2.waitKey(1)
    except:
        print("Unknown Error:", sys.exc_info()[0])
        raise    

def on_error(ws, error):
    print error

def on_close(ws):
    print "### closed ###"

def on_open(ws):
    print "### opened ###"

def start_left_socket(image_queue):
    ws = websocket.WebSocketApp(leftEyeSocketUrl, on_message = on_message, on_error = on_error, on_close = on_close)
    ws.on_open = on_open
    ws.run_forever()

def start_right_socket(image_queue):
    ws = websocket.WebSocketApp(rightEyeSocketUrl, on_message = on_message2, on_error = on_error, on_close = on_close)
    ws.on_open = on_open
    ws.run_forever()    

if __name__ == '__main__':
    print("starting main")
    leftEyeSocketUrl = "ws://192.168.1.106:8090"
    rightEyeSocketUrl = "ws://192.168.1.106:8091"

    left_image_queue = multiprocessing.Queue(1)
    right_image_queue = multiprocessing.Queue(1)

    try:
        left_eye_process = multiprocessing.Process(target=start_left_socket,args=(left_image_queue,))
        left_eye_process.start()
        right_eye_process = multiprocessing.Process(target=start_right_socket,args=(right_image_queue,))
        right_eye_process.start()
    except:
        print("Unknown Error:", sys.exc_info()[0])
        raise
