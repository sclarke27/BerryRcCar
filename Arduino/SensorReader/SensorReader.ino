#include <HM55B_Compass.h>
#include <Servo.h>

HM55B_Compass compass(8, 9, 10);

int lastDuration = 0;
int lastAngle = 0;
int angleBuffer[3] = {0, 0, 0};
int durationBuffer[3] = {0, 0, 0};

void setup() {
  pinMode(5, INPUT);
  // initialize serial communication:
  Serial.begin(9600);
  compass.initialize();
}

int normalizeRadioInput(int inputValue) {
  return map(inputValue, 1100, 1900, -500, 500);
}

void loop()
{
  delay(40);
  long duration;
  int pingOutPin = 7;
  int pingInPin = 6;


  int rcCh1 = pulseIn(5, HIGH, 25000);
  int rcCh2 = pulseIn(4, HIGH, 25000);

  if (rcCh1 != 0) {
    Serial.print("rc1:");
    Serial.print(normalizeRadioInput(rcCh1));
    Serial.println();
  }
  
  if (rcCh2 != 0) {
    Serial.print("rc2:");
    Serial.print(normalizeRadioInput(rcCh2));
    Serial.println();
  }
  
  // The PING))) is triggered by a HIGH pulse of 2 or more microseconds.
  // Give a short LOW pulse beforehand to ensure a clean HIGH pulse:
  pinMode(pingOutPin, OUTPUT);
  digitalWrite(pingOutPin, LOW);
  delayMicroseconds(2);
  digitalWrite(pingOutPin, HIGH);
  delayMicroseconds(5);
  digitalWrite(pingOutPin, LOW);

  // The same pin is used to read the signal from the PING))): a HIGH
  // pulse whose duration is the time (in microseconds) from the sending
  // of the ping to the reception of its echo off of an object.
  pinMode(pingInPin, INPUT);
  duration = pulseIn(pingInPin, HIGH);
  durationBuffer[2] = durationBuffer[1];
  durationBuffer[1] = durationBuffer[0];
  durationBuffer[0] = duration;
  int bufferedDuration = (durationBuffer[0] + durationBuffer[1] + durationBuffer[2]) / 3;
  
  if (bufferedDuration != lastDuration) {
    Serial.print("dist:");
    Serial.print(bufferedDuration);
    Serial.println();
    lastDuration = bufferedDuration;
  }

  //grab angle sensor values
  int angle = compass.read();
  if (angle != HM55B_Compass::NO_VALUE) {
    angleBuffer[2] = angleBuffer[1];
    angleBuffer[1] = angleBuffer[0];
    angleBuffer[0] = angle;
    int bufferedAngle = (angleBuffer[0] + angleBuffer[1] + angleBuffer[2]) / 3;
    if(bufferedAngle != lastAngle) {
      Serial.print("angle:");
      Serial.print(bufferedAngle);
      Serial.println();
      lastAngle = bufferedAngle;
    }
  }
}

