import serial
import sys
import os
from time import sleep

ser = serial.Serial('/dev/ttyACM0', 9600, timeout=1)

frontDist = "0";
angle = "0";
rcChannel1 = "0";
rcChannel2 = "0";

if ser.is_open == True:
    ser.close()

if ser.is_open == False:
    ser.open()

s =[0]

def setRcChannel1(newVal):
    global rcChannel1
    rcChannel1 = newVal
#end setRcChannel1

def setRcChannel2(newVal):
    global rcChannel2
    rcChannel2 = newVal
#end setRcChannel2

def setDistance(newVal):
    global frontDist
    frontDist = newVal
#end setDistance

def setAngle(newAngle):
    global angle
    angle = newAngle
#end setAngle
    
def handleCommand(key, value):
    if key == "dist":
        setDistance(value)
    if key == "angle":
        setAngle(value)
    if key == "rc1":
        setRcChannel1(value)
    if key == "rc2":
        setRcChannel2(value)
        
#end handleCommanddef        

def handleIncomingMsg(msg):
    commandList = msg.split(":")
    if len(commandList) >= 2:
        commandKey = commandList[0]
        commandValue = commandList[1]
        handleCommand(commandKey, commandValue)
#end handleIncomingMsg
        

while True:
    incomingMsg = ser.readline()
    
    if len(incomingMsg) > 2:
        handleIncomingMsg(incomingMsg.strip());
    # endif

    os.system('cls' if os.name == 'nt' else 'clear')
    sys.stdout.write("front distance:" + frontDist + "\n")
    sys.stdout.write("angle:" + angle + "\n")
    sys.stdout.write("rc1:" + rcChannel1 + "\n")
    sys.stdout.write("rc2:" + rcChannel2 + "\n")
#end main
