#!/usr/bin/env python
import time
import sys
sys.path.append('modules')
import ParallaxServoController as PSC
import multiprocessing
import pprint
from pymongo import MongoClient

throttleChannel = 4
steeringChannel = 0
panChannel = 1
tiltChannel = 2
currTiltValue = 0;
currPanValue = 0;
currSteeringValue = 0;
currThrottleValue = 0;
jobs = []
showDebug = False
psc0 = PSC.ParallaxServoController('/dev/ttyUSB0')
#psc1 = PSC.ParallaxServoController('/dev/ttyUSB1')
mongoClient = MongoClient()
db = mongoClient['otherbarry']

radioData = {
    'tiltRadio': 90,
    'panRadio': 90,
    'steeringRadio': 90,
    'throttleRadio': 0,
}

botState = {
    'currentIntent': '',
    'canMove': False,
    'isAutonomous': False,
}

def testTiltPan():
  print "test tiltpan"
  psc0.setServoPos(1, 0)
  psc0.setServoPos(1, 180)
  psc0.setServoPos(1, 90)
  psc0.setServoPos(2, 0)
  psc0.setServoPos(2, 180)
  psc0.setServoPos(2, 90)

  print "stop"
  psc0.setServoPos(1, 90)
  psc0.setServoPos(2, 45)

def handleTiltData(newValue):
    try:
        psc0.setServoPos(tiltChannel, newValue)
    except:
        e = sys.exc_info()[0]
        if showDebug:
            print e

def handlePanData(newValue):
    try:
        psc0.setServoPos(panChannel, newValue)
    except:
        e = sys.exc_info()[0]
        if showDebug:
            print e

def handleSteeringData(newValue):
    try:
        psc0.setServoPos(steeringChannel, newValue)
    except:
        e = sys.exc_info()[0]
        if showDebug:
            print e

def handleThrottleData(newValue):
    try:
        psc0.setServoPos(throttleChannel, newValue)
    except:
        e = sys.exc_info()[0]
        if showDebug:
            print e

def refreshData():
    for data in db.botData.find():
        if data['name'] == 'tiltRadio':
            radioData['tiltRadio'] = data['value']

        if data['name'] == 'panRadio':
            radioData['panRadio'] = data['value']

        if data['name'] == 'steeringRadio':
            radioData['steeringRadio'] = data['value']

        if data['name'] == 'throttleRadio':
            radioData['throttleRadio'] = data['value']


print('Start Servo Controller')
while True:
    refreshData()

    if radioData['tiltRadio'] != currTiltValue:
        currTiltValue = radioData['tiltRadio']
        tiltProcess = multiprocessing.Process(target=handleTiltData, args=(int(currTiltValue),))
        jobs.append(tiltProcess)
        tiltProcess.start();

    if radioData['panRadio'] != currPanValue:
        currPanValue = radioData['panRadio']
        panProcess = multiprocessing.Process(target=handlePanData, args=(int(currPanValue),))
        jobs.append(panProcess)
        panProcess.start();

    if radioData['steeringRadio'] != currSteeringValue:
        currSteeringValue = radioData['steeringRadio']
        steerProcess = multiprocessing.Process(target=handleSteeringData, args=(int(currSteeringValue),))
        jobs.append(steerProcess)
        steerProcess.start();

    if radioData['throttleRadio'] != currThrottleValue:
        currThrottleValue = radioData['throttleRadio']
        throttleProcess = multiprocessing.Process(target=handleThrottleData, args=(int(currThrottleValue),))
        jobs.append(throttleProcess)
        throttleProcess.start();

    time.sleep(0.1);

