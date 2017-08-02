#!/usr/bin/env python
import time
import sys
sys.path.append('modules')
import ParallaxServoController as PSC
import socket

servo = PSC.ParallaxServoController('/dev/ttyUSB1')

def testSteering():
  print "test steering"
  servo.setServoPos(0, 0)
  servo.setServoPos(0, 180)
  servo.setServoPos(0, 90)

  print "stop"
  servo.setServoPos(0, 90)
  
def testTiltPan():
  print "test steering"
  servo.setServoPos(1, 0)
  servo.setServoPos(1, 180)
  servo.setServoPos(1, 90)
  servo.setServoPos(2, 0)
  servo.setServoPos(2, 180)
  servo.setServoPos(2, 90)

  print "stop"
  servo.setServoPos(1, 90)
  servo.setServoPos(2, 45)
  

testSteering()
testTiltPan()
print('start steering socket')
s = socket.socket()
host = "localhost"
port = 2001
s.bind((host, port))

s.listen(5)
while True:
  c, addr = s.accept()
  print('connection from',addr)
  c.send('thanks')
  msg = c.recv(1024)
  if msg == "left":
    servo.setServoPos(0, 0)
  elif msg == "right":
    servo.setServoPos(0, 180)
  elif msg == "test":
    testSteering()
  elif msg == "testTiltPan":
    testSteering()
  else:
    servo.setServoPos(0, 90)
    
  print msg
  c.close()
  
  
    