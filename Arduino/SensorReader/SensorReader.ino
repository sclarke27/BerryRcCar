#include <HM55B_Compass.h>
#include <Servo.h>

// Hadrware values
int rcChannel1Pin = 4;
int rcChannel2Pin = 5;
int pingPin1 = 6;
int pingPin2 = 7;
int compassClockPin = 8;
int compassEnablePin = 9;
int compassIOPin = 10;

HM55B_Compass compass(compassClockPin, compassEnablePin, compassIOPin);

int normalizeRadioInput(int inputValue) {
  return map(inputValue, 1100, 1900, -500, 500);
}

String readRcRadio(String channel, int pin) {
  String returnStr = "";
  int channelPulse = pulseIn(pin, HIGH, 25000);
  if (channelPulse != 0) {
    returnStr += ",rc" + channel + ":";
    returnStr += normalizeRadioInput(channelPulse);
  }
  return returnStr;
}

String readPingSensor(String channel, int pin) {
  // The PING))) is triggered by a HIGH pulse of 2 or more microseconds.
  // Give a short LOW pulse beforehand to ensure a clean HIGH pulse:
  pinMode(pin, OUTPUT);
  digitalWrite(pin, LOW);
  delayMicroseconds(2);
  digitalWrite(pin, HIGH);
  delayMicroseconds(5);
  digitalWrite(pin, LOW);

  pinMode(pin, INPUT);
  int duration = pulseIn(pin, HIGH);

  String returnStr = "";
  if(duration != 0) {
    returnStr += ",dist" + channel + ":";
    returnStr += duration;
  }
  return returnStr;
}

String readCompass() {
  //grab angle sensor values
  String returnStr = "";
  int angle = compass.read();
  if (angle != HM55B_Compass::NO_VALUE) {
    returnStr += ",compass:";
    returnStr += angle;
  }
  return returnStr;
}

void setup() {
  Serial.begin(115200);
  compass.initialize();
}

void loop()
{
  delay(40);
  String returnString = "";

  returnString += readRcRadio("1", rcChannel1Pin);
  returnString += readRcRadio("2", rcChannel2Pin);

  returnString += readPingSensor("1", pingPin1);
  returnString += readPingSensor("2", pingPin2);

  returnString += readCompass();

  if(returnString != "") {
    Serial.println("isActive:true" + returnString + ",end:false");
    returnString = "";
  }

}
