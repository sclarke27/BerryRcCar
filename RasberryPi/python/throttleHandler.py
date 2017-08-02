#!/usr/bin/env python
import time
import sys
sys.path.append('modules')
import ParallaxServoController as PSC
import socket

servo = PSC.ParallaxServoController('/dev/ttyUSB0')

motorSpeed = 0

minSpeed = 84 # min between 83 and 84
maxSpeed = 94 # min between 94 and 95
allStop = 90
index = 0;
throttlePin = 2

def testThrottle():
  index = 0
  for x in range(0, 2):
    time.sleep(1)
    motorSpeed = index
    setSpeed = minSpeed-motorSpeed
    print "forward"
    print setSpeed
    servo.setServoPos(throttlePin, setSpeed, 20)
    index = index + 1

  time.sleep(2)
  print "stop"
  servo.setServoPos(throttlePin, 90)
  index = 0
  for x in range(0, 2):
    time.sleep(1)
    motorSpeed = index
    setSpeed = maxSpeed+motorSpeed
    print "reverse"
    print setSpeed
    servo.setServoPos(throttlePin, setSpeed, 20)
    index = index + 1

  time.sleep(2)
  print "stop"
  servo.setServoPos(throttlePin, 90)
  
  
print('start throttle socket')
s = socket.socket()
host = "localhost"
port = 2002
s.bind((host, port))

print "stop"
testThrottle()


s.listen(5)
while True:
  c, addr = s.accept()
  print('connection from',addr)
  c.send('thanks')
  msg = c.recv(1024)
  if msg == "forward":
    servo.setServoPos(throttlePin, minSpeed - 0.5)
  elif msg == "reverse":
    servo.setServoPos(throttlePin, maxSpeed + 0.5)
  elif msg == "testThrottle":
    testThrottle()
  else:
    servo.setServoPos(throttlePin, allStop)

  print msg
  c.close()