import multiprocessing
import cv2
import base64
import numpy as np
import websocket
import sys
import zlib
import os
import json

from websocket import create_connection


def on_message(ws, message):
    # print message
    try:
        host = 'ws://192.168.1.106:5620'
        ws = create_connection(host)
        frameStr = message
        img = base64.b64decode(frameStr)
        img = zlib.decompress(img)
        npimg = np.fromstring(img, dtype=np.uint8)
        frame = cv2.imdecode(npimg, 1)
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
                "x2": y+h,
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
                    "x2": ey+h
                })

            faceResult.append(currFace)
    
        resultStr = str(faceResult)
        message = "@command(node:\"/botState\",lane:\"setLeftEyeFaces\"){\"" + resultStr + "\"}"
        # print(message)
        ws.send(message)     

        # cv2.imshow("Left Eye Face Detect", frame)
        # cv2.waitKey(1)
    except:
        print("Unknown Error:", sys.exc_info()[0])
        raise    

def on_message2(ws, message):
    # print message
    try:
        host = 'ws://192.168.1.106:5620'
        ws = create_connection(host)
        frame = message
        img = base64.b64decode(frame)
        img = zlib.decompress(img)
        npimg = np.fromstring(img, dtype=np.uint8)
        source = cv2.imdecode(npimg, 1)
        frame = cv2.imdecode(npimg, 1)
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
                "x2": y+h,
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
                    "x2": ey+h
                })

            faceResult.append(currFace)
    
        resultStr = str(faceResult)
        message = "@command(node:\"/botState\",lane:\"setRightEyeFaces\"){\"" + resultStr + "\"}"
        # print(message)
        ws.send(message)   

        # cv2.imshow("Right Eye Face Detect", frame)
        # cv2.waitKey(1)
    except:
        print("Unknown Error:", sys.exc_info())
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

    data_path = os.path.dirname(os.path.abspath(__file__)) + '/data/'

    face_cascade = cv2.CascadeClassifier(data_path + 'haarcascades/haarcascade_frontalface_default.xml')
    eye_cascade = cv2.CascadeClassifier(data_path + 'haarcascades/haarcascade_eye.xml')

    if face_cascade.empty():
        print('face cascade not found')

    if eye_cascade.empty():
        print('eye cascade not found')

    try:
        left_eye_process = multiprocessing.Process(target=start_left_socket,args=(left_image_queue,))
        left_eye_process.start()
        right_eye_process = multiprocessing.Process(target=start_right_socket,args=(right_image_queue,))
        right_eye_process.start()
    except:
        print("Unknown Error:", sys.exc_info()[0])
        raise
