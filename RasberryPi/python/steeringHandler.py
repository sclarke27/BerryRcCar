#!/usr/bin/env python
import time
import sys
sys.path.append('modules')
import ParallaxServoController as PSC
import socket
import multiprocessing

servo = PSC.ParallaxServoController('/dev/ttyUSB3')

def testSteering():
  print "test steering"
  servo.setServoPos(0, 0)
  servo.setServoPos(0, 180)
  servo.setServoPos(0, 90)

  print "stop"
  servo.setServoPos(0, 90)

def testTiltPan():
  print "test tiltpan"
  servo.setServoPos(1, 0)
  servo.setServoPos(1, 180)
  servo.setServoPos(1, 90)
  servo.setServoPos(2, 0)
  servo.setServoPos(2, 180)
  servo.setServoPos(2, 90)

  print "stop"
  servo.setServoPos(1, 90)
  servo.setServoPos(2, 45)

def setSteering(pos):
  servo.setServoPos(0, pos)

def setTilt(pos):
  servo.setServoPos(2, pos)

def setPan(pos):
  servo.setServoPos(1, pos)


#testSteering()
#testTiltPan()
print('start steering socket')
s = socket.socket()
host = "localhost"
port = 2001
s.bind((host, port))
s.listen(5)

def handleMessage(msg):
  print msg
  if msg == "left":
    servo.setServoPos(0, 0)
  elif msg == "right":
    servo.setServoPos(0, 180)
  elif msg == "center":
    servo.setServoPos(0, 90)
  elif msg == "testSteering":
    testSteering()
  elif msg == "testTiltPan":
    testTiltPan()
  else:
    servo.setServoPos(0, 90)


jobs = []

while True:
  c, addr = s.accept()
  print('connection from',addr)
  msg = c.recv(1024)
  c.close()

  process = multiprocessing.Process(target=handleMessage, args=(msg,))
  jobs.append(process)
  process.start()
