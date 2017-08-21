#include <HM55B_Compass.h>
#include <Servo.h>
#include <TimedAction.h>

// Hadrware values
int rcChannel1Pin = 4;
int rcChannel2Pin = 5;
int pingPin1 = 6;
int pingPin2 = 7;
int compassClockPin = 8;
int compassEnablePin = 9;
int compassIOPin = 10;

//Data Values
int rcChannel1Value = 0;
int rcChannel2Value = 0;
int ping1Value = 0;
int ping2Value = 0;
int compass1Value = 0;

int rcChannel1ValueNew = 0;
int rcChannel2ValueNew = 0;
int ping1ValueNew = 0;
int ping2ValueNew = 0;
int compass1ValueNew = 0;

HM55B_Compass compass(compassClockPin, compassEnablePin, compassIOPin);

int normalizeRadioInput(int inputValue) {
  return map(inputValue, 1100, 1900, -500, 500);
}

void readRcRadio(String channel, int pin) {
  int channelPulse = pulseIn(pin, HIGH, 25000);
  if (channelPulse != 0 && pin == rcChannel1Pin) {
    rcChannel1ValueNew = normalizeRadioInput(channelPulse);
  }
  if (channelPulse != 0 && pin == rcChannel2Pin) {
    rcChannel2ValueNew = normalizeRadioInput(channelPulse);
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

  if(pin == 6) {
    ping1ValueNew = duration;
  }
  if(pin == 7) {
    ping2ValueNew = duration;
  }
}

void readCompass1() {
  //grab angle sensor values
  int angle = compass.read();
  if (angle != HM55B_Compass::NO_VALUE) {
    compass1ValueNew = angle;
  }
}

void setup() {
  Serial.begin(115200);
  compass.initialize();
}

void readPing1() {
  readPingSensor("1", pingPin1);
}

void readPing2() {
  readPingSensor("2", pingPin2);
}
TimedAction ping1Read = TimedAction(11, readPing1);
TimedAction ping2Read = TimedAction(12, readPing2);
TimedAction compass1Read = TimedAction(23, readCompass1);

void loop()
{
  delay(10);
  ping1Read.check();
  ping2Read.check();
  compass1Read.check();
  readRcRadio("1", rcChannel1Pin);
  readRcRadio("2", rcChannel2Pin);
  String returnString = "{active:true";

  if(ping1Value != ping1ValueNew) {
    ping1Value = ping1ValueNew;
    returnString += ",leftDistance:";
    returnString += ping1Value;
  }
  if(ping2Value != ping2ValueNew) {
    ping2Value = ping2ValueNew;
    returnString += ",rightDistance:";
    returnString += ping2Value;
  }
  if(compass1Value != compass1ValueNew) {
    compass1Value = compass1ValueNew;
    returnString += ",compass1:";
    returnString += compass1Value;
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
  
  if(returnString != "{active:true") {
    Serial.println(returnString + ",end:true}");
    returnString = "";
  }

}
