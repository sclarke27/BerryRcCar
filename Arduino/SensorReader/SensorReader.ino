#include <HM55B_Compass.h>
#include <Servo.h>
#include <TimedAction.h>
#include <SFE_BMP180.h>
#include <Wire.h>

// Hadrware values
int rcChannel1Pin = 4;
int rcChannel2Pin = 5;
int rcChannel3Pin = 2;
int rcChannel4Pin = 3;
int pingPin1 = 6;
int pingPin2 = 7;
int pingPin3 = 11;
int pingPin4 = 12;
int compassClockPin = 8;
int compassEnablePin = 9;
int compassIOPin = 10;

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
int compass1ValueNew = 0;

#define ALTITUDE 105.0/3.28084 //elevation of cataldi park

HM55B_Compass compass(compassClockPin, compassEnablePin, compassIOPin);
SFE_BMP180 pressure;

int normalizeRadioInput(int inputValue) {
  return map(inputValue, 1050, 1950, -100, 100);
}

void readRcRadio(String channel, int pin) {
  int channelPulse = pulseIn(pin, HIGH, 35000);
  channelPulse = normalizeRadioInput(channelPulse);
  if (pin == rcChannel1Pin) {
    rcChannel1Value = channelPulse;
  }
  if (pin == rcChannel2Pin) {
    rcChannel2Value =  channelPulse;
  }
  if (pin == rcChannel3Pin) {
    rcChannel3Value =  channelPulse;
  }
  if (pin == rcChannel4Pin) {
    rcChannel4Value =  channelPulse;
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
      tempuratureValue = ((9.0/5.0)*T+32.0);

      sensorStatus = pressure.getPressure(P,T);
      if(sensorStatus != 0) {
        p0 = pressure.sealevel(P,ALTITUDE);
        pressureValue = P;//P*0.0295333727;
        altitudeValue = pressure.altitude(P,p0)*3.28084;
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
  int maxDist = 10000;

  pinMode(pin, INPUT);
  int duration = pulseIn(pin, HIGH, maxDist);

  if(duration == 0) {
    duration = 10000;
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
TimedAction ping1Read = TimedAction(5, readPing1);
TimedAction ping2Read = TimedAction(5, readPing2);
TimedAction ping3Read = TimedAction(5, readPing3);
TimedAction ping4Read = TimedAction(5, readPing4);
TimedAction compass1Read = TimedAction(50, readCompass1);
TimedAction temperatureRead = TimedAction(500, readTempAndPressure);

void loop()
{
  delay(10);
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


  returnString += ",tempurature:";
  returnString += tempuratureValue;
  returnString += ",pressure:";
  returnString += pressureValue;
  returnString += ",altitude:";
  returnString += altitudeValue;
  returnString += ",steeringRadio:";
  returnString += rcChannel1Value;
  returnString += ",throttleRadio:";
  returnString += rcChannel2Value;
  returnString += ",tiltRadio:";
  returnString += rcChannel3Value;
  returnString += ",panRadio:";
  returnString += rcChannel4Value;
  

  //if(ping1Value != ping1ValueNew) {
    ping1Value = ping1ValueNew;
    returnString += ",groundDistance:";
    returnString += ping1Value;
  //}
  //if(ping2Value != ping2ValueNew) {
    ping2Value = ping2ValueNew;
    returnString += ",centerDistance:";
    returnString += ping2Value;
  //}
  //if(ping3Value != ping3ValueNew) {
    ping3Value = ping3ValueNew;
    returnString += ",rightDistance:";
    returnString += ping3Value;
  //}
  //if(ping4Value != ping4ValueNew) {
    ping4Value = ping4ValueNew;
    returnString += ",leftDistance:";
    returnString += ping4Value;
  //}
  //if(compass1Value != compass1ValueNew) {
    compass1Value = compass1ValueNew;
    returnString += ",compass1:";
    returnString += compass1Value;
  //}
  
  if(returnString != "{active:true") {
    Serial.println(returnString + ",end:true}");
    returnString = "";
  }

}
