#include <HM55B_Compass.h>
#include <Servo.h>
#include <TimedAction.h>
#include <SFE_BMP180.h>
#include <Wire.h>

// Hadrware values
int rcChannel1Pin = 2;
int rcChannel2Pin = 3;
int rcChannel3Pin = 4;
int rcChannel4Pin = 5;
int pingPin1 = 6;
int pingPin2 = 7;
int pingPin3 = 8;
int pingPin4 = 9;
int compassClockPin = 10;
int compassEnablePin = 11;
int compassIOPin = 12;

//Data Values
int rcChannel1Value = 0;
int rcChannel2Value = 0;
int rcChannel3Value = 0;
int rcChannel4Value = 0;
int ping1Value = 0;
int ping2Value = 0;
int ping3Value = 0;
int ping4Value = 0;
int compass1Value = 0;
double tempuratureValue = 0.0;
double pressureValue = 0.0;
double altitudeValue = 0.0;

int ping1ValueNew = 0;
int ping2ValueNew = 0;
int ping3ValueNew = 0;
int ping4ValueNew = 0;
int rcChannel1ValueNew = 0;
int rcChannel2ValueNew = 0;
int rcChannel3ValueNew = 0;
int rcChannel4ValueNew = 0;
int compass1ValueNew = 0;
double tempuratureValueNew = 0.0;
double pressureValueNew = 0.0;
double altitudeValueNew = 0.0;

#define ALTITUDE 105.0/3.28084 //elevation of cataldi park

HM55B_Compass compass(compassClockPin, compassEnablePin, compassIOPin);
SFE_BMP180 pressure;

int normalizeRadioInput(int inputValue) {
  return map(inputValue, 1050, 1950, 75, 105);
}

int normalizeRadioInputForServo(int inputValue) {
  return map(inputValue, 1050, 1950, 0, 180);
}

void readRcRadio(String channel, int pin) {
  int channelPulse = pulseIn(pin, HIGH, 35000);
  if(channelPulse != 0) {
    if(pin == rcChannel2Pin) {
      channelPulse = normalizeRadioInput(channelPulse);
    } else {
      channelPulse = normalizeRadioInputForServo(channelPulse);
    }
  }
  if (pin == rcChannel1Pin) {
    rcChannel1ValueNew = channelPulse;
  }
  if (pin == rcChannel2Pin) {
    rcChannel2ValueNew =  channelPulse;
  }
  if (pin == rcChannel3Pin) {
    rcChannel3ValueNew =  channelPulse;
  }
  if (pin == rcChannel4Pin) {
    rcChannel4ValueNew =  channelPulse;
  }
  
}

void readTempAndPressure() {
  double T, P, p0, a;
  char sensorStatus;
  sensorStatus = pressure.startTemperature();
  if(sensorStatus != 0) {
    delay(sensorStatus);

    sensorStatus = pressure.getTemperature(T);
    if(sensorStatus != 0) {
      tempuratureValueNew = ((9.0/5.0)*T+32.0);

      sensorStatus = pressure.getPressure(P,T);
      if(sensorStatus != 0) {
        p0 = pressure.sealevel(P,ALTITUDE);
        pressureValueNew = P;//P*0.0295333727;
        altitudeValueNew = pressure.altitude(P,p0)*3.28084;
      }
    }
  }
}

void readPingSensor(String channel, int pin) {
  // The PING))) is triggered by a HIGH pulse of 2 or more microseconds.
  // Give a short LOW pulse beforehand to ensure a clean HIGH pulse:
  pinMode(pin, OUTPUT);
  digitalWrite(pin, LOW);
  delayMicroseconds(2);
  digitalWrite(pin, HIGH);
  delayMicroseconds(5);
  digitalWrite(pin, LOW);
  int pingTimeout = 17000;

  pinMode(pin, INPUT);
  int duration = pulseIn(pin, HIGH, pingTimeout);

  if(duration == 0) {
    duration = 40000;
  }

  if(pin == pingPin1) {
    ping1ValueNew = duration;
  }
  if(pin == pingPin2) {
    ping2ValueNew = duration;
  }
  if(pin == pingPin3) {
    ping3ValueNew = duration;
  }

  if(pin == pingPin4) {
    ping4ValueNew = duration;
  }

}

void readCompass1() {
  //grab angle sensor values
  int angle = compass.read();
  if (angle != HM55B_Compass::NO_VALUE) {
    compass1ValueNew = angle;
  }
}


void readPing1() {
  readPingSensor("1", pingPin1);
}

void readPing2() {
  readPingSensor("2", pingPin2);
}

void readPing3() {
  readPingSensor("3", pingPin3);
}

void readPing4() {
  readPingSensor("4", pingPin4);
}

void setup() {
  Serial.begin(115200);
  compass.initialize();
  if(pressure.begin()) {
    Serial.println("bmp180 started");
  } else {
    Serial.println("bmp180 failed");
  }
}
TimedAction ping1Read = TimedAction(1, readPing1);
TimedAction ping2Read = TimedAction(1, readPing2);
TimedAction ping3Read = TimedAction(1, readPing3);
TimedAction ping4Read = TimedAction(1, readPing4);
TimedAction compass1Read = TimedAction(1, readCompass1);
TimedAction temperatureRead = TimedAction(1, readTempAndPressure);

void loop()
{
  ping1Read.check();
  ping2Read.check();
  ping3Read.check();
  ping4Read.check();
  compass1Read.check();
  temperatureRead.check();
  readRcRadio("1", rcChannel1Pin);
  readRcRadio("2", rcChannel2Pin);
  readRcRadio("3", rcChannel3Pin);
  readRcRadio("4", rcChannel4Pin);
  String returnString = "{active:true";


  if(tempuratureValue != tempuratureValueNew) {
    tempuratureValue = tempuratureValueNew;
    returnString += ",tempurature:";
    returnString += tempuratureValue;
  }
  if(pressureValue != pressureValueNew) {
    pressureValue = pressureValueNew;
    returnString += ",pressure:";
    returnString += pressureValue;
  }
  if(altitudeValue != altitudeValueNew) {
    altitudeValue = altitudeValueNew;
    returnString += ",altitude:";
    returnString += altitudeValue;
  }
  if(rcChannel1Value != rcChannel1ValueNew) {
    rcChannel1Value = rcChannel1ValueNew;
    returnString += ",steeringRadio:";
    returnString += rcChannel1Value;
  }
  if(rcChannel2Value != rcChannel2ValueNew) {
    rcChannel2Value = rcChannel2ValueNew;
    returnString += ",throttleRadio:";
    returnString += rcChannel2Value;
  }
  if(rcChannel3Value != rcChannel3ValueNew) {
    rcChannel3Value = rcChannel3ValueNew;
    returnString += ",tiltRadio:";
    returnString += rcChannel3Value;
  }
  if(rcChannel4Value != rcChannel4ValueNew) {
    rcChannel4Value = rcChannel4ValueNew;
    returnString += ",panRadio:";
    returnString += rcChannel4Value;
  }  

  if(ping1Value != ping1ValueNew) {
    ping1Value = ping1ValueNew;
    returnString += ",groundDistance:";
    returnString += ping1Value;
  }
  if(ping2Value != ping2ValueNew) {
    ping2Value = ping2ValueNew;
    returnString += ",centerDistance:";
    returnString += ping2Value;
  }
  if(ping3Value != ping3ValueNew) {
    ping3Value = ping3ValueNew;
    returnString += ",rightDistance:";
    returnString += ping3Value;
  }
  if(ping4Value != ping4ValueNew) {
    ping4Value = ping4ValueNew;
    returnString += ",leftDistance:";
    returnString += ping4Value;
  }
  if(compass1Value != compass1ValueNew) {
    compass1Value = compass1ValueNew;
    returnString += ",compass1:";
    returnString += compass1Value;
  }
  
  if(returnString != "{active:true") {
    Serial.println(returnString + ",end:true}");
    returnString = "";
  }

}
