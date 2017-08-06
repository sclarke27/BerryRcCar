#include <HM55B_Compass.h>
#include <Servo.h>

HM55B_Compass compass(8, 9, 10);

int lastDuration1 = 0;
int lastDuration2 = 0;
int lastAngle = 0;
int angleBuffer[3] = {0, 0, 0};
int durationBuffer[3] = {0, 0, 0};
String returnString = "";
long duration1;
long duration2;
int pingPin1 = 6;
int pingPin2 = 7;

void setup() {
  pinMode(5, INPUT);
  // initialize serial communication:
  Serial.begin(115200);
  compass.initialize();
}

int normalizeRadioInput(int inputValue) {
  return map(inputValue, 1100, 1900, -500, 500);
}

void loop()
{
  delay(40);

  int rcCh1 = pulseIn(5, HIGH, 25000);
  int rcCh2 = pulseIn(4, HIGH, 25000);

  if (rcCh1 != 0) {
    returnString += ",rc1:";
    returnString += normalizeRadioInput(rcCh1);
  }
  
  if (rcCh2 != 0) {
    returnString += ",rc2:";
    returnString += normalizeRadioInput(rcCh2);
  }

  // The PING))) is triggered by a HIGH pulse of 2 or more microseconds.
  // Give a short LOW pulse beforehand to ensure a clean HIGH pulse:
  pinMode(pingPin1, OUTPUT);
  digitalWrite(pingPin1, LOW);
  delayMicroseconds(2);
  digitalWrite(pingPin1, HIGH);
  delayMicroseconds(5);
  digitalWrite(pingPin1, LOW);

  pinMode(pingPin1, INPUT);
  duration1 = pulseIn(pingPin1, HIGH);

  if(duration1 != lastDuration1) {
    returnString += ",dist1:";
    returnString += duration1;
    lastDuration1 = duration1;
  }

  pinMode(pingPin2, OUTPUT);
  digitalWrite(pingPin2, LOW);
  delayMicroseconds(2);
  digitalWrite(pingPin2, HIGH);
  delayMicroseconds(5);
  digitalWrite(pingPin2, LOW);

  pinMode(pingPin2, INPUT);
  duration2 = pulseIn(pingPin2, HIGH);

  if(duration2 != lastDuration2) {
    returnString += ",dist2:";
    returnString += duration2;
    lastDuration2 = duration2;
  }

  //grab angle sensor values
  int angle = compass.read();
  if (angle != HM55B_Compass::NO_VALUE) {
    angleBuffer[2] = angleBuffer[1];
    angleBuffer[1] = angleBuffer[0];
    angleBuffer[0] = angle;
    int bufferedAngle = (angleBuffer[0] + angleBuffer[1] + angleBuffer[2]) / 3;
    if(bufferedAngle != lastAngle) {
      returnString += ",compass:";
      returnString += angle;
      lastAngle = bufferedAngle;
    }
  }



  
  if(returnString != "") {
    Serial.println("isActive:true" + returnString + ",end:false");
    returnString = "";
  }

  
}

