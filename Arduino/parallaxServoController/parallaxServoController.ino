#include <SoftwareSerial.h>

#define rxPin 6
#define txPin 7

SoftwareSerial servoController = SoftwareSerial(rxPin, txPin);
byte BR = 1;

void SetServoPos(byte channel, int pos, byte ramp) {
  int realPos = 750;

  byte lsb = realPos;
  byte msb = realPos >> 8;

  servoController.write("!SC");
  servoController.write(channel);
  servoController.write(ramp);
  servoController.write(lsb);
  servoController.write(msb);
  servoController.write(13);
}

void setup() {
  // put your setup code here, to run once:
  pinMode(rxPin, INPUT);
  pinMode(txPin, OUTPUT);

  servoController.begin(2400);
  digitalWrite(13, HIGH);

  delay(2000);

  servoController.write("!SCSBR");
  servoController.write(BR);
  servoController.write(13);

  servoController.begin(38400);

}

void loop() {
  // put your main code here, to run repeatedly:

  SetServoPos(1, 0, 50);
  delay(5000);
  SetServoPos(1, 180, 50);
  delay(5000);

  
}


