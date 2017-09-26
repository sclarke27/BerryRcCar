#include <HM55B_Compass.h>
#include <Servo.h>
#include <TimedAction.h>
#include <SFE_BMP180.h>
#include <Wire.h>
#include "quaternionFilters.h"
#include "MPU9250.h"
#include <Adafruit_Sensor.h>
#include <Adafruit_BMP085_U.h>

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
double tempurature2Value = 0.0;
double pressureValue = 0.0;
double altitudeValue = 0.0;
double xAccelValue = 0.0;
double yAccelValue = 0.0;
double zAccelValue = 0.0;
double xGyroValue = 0.0;
double yGyroValue = 0.0;
double zGyroValue = 0.0;
double xMagValue = 0.0;
double yMagValue = 0.0;
double zMagValue = 0.0;


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
double tempurature2ValueNew = 0.0;
double pressureValueNew = 0.0;
double altitudeValueNew = 0.0;

double xAccelValueNew = 0.0;
double yAccelValueNew = 0.0;
double zAccelValueNew = 0.0;
double xGyroValueNew = 0.0;
double yGyroValueNew = 0.0;
double zGyroValueNew = 0.0;
double xMagValueNew = 0.0;
double yMagValueNew = 0.0;
double zMagValueNew = 0.0;

#define ALTITUDE 105.0/3.28084 //elevation of cataldi park

HM55B_Compass compass(compassClockPin, compassEnablePin, compassIOPin);
Adafruit_BMP085_Unified bmp = Adafruit_BMP085_Unified(10085);
MPU9250 myIMU;

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
      channelPulse = normalizeRadioInputForServo(channelPulse);
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
  sensors_event_t event;
  bmp.getEvent(&event);
  if (event.pressure)
  {
    pressureValueNew = event.pressure;
    float temp;
    bmp.getTemperature(&temp);
    tempuratureValueNew = ((9.0/5.0)*temp+32.0);
    float seaLevelPressure = SENSORS_PRESSURE_SEALEVELHPA;
    altitudeValueNew = bmp.pressureToAltitude(seaLevelPressure, event.pressure); 
    
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
  int pingTimeout = 15000;

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

void readRadio1() {
  readRcRadio("1", rcChannel1Pin);
}
void readRadio2() {
  readRcRadio("2", rcChannel2Pin);
}
void readRadio3() {
  readRcRadio("3", rcChannel3Pin);
}
void readRadio4() {
  readRcRadio("4", rcChannel4Pin);
}


void readGyro() {
  // If intPin goes high, all data registers have new data
  // On interrupt, check if data ready interrupt
  if (myIMU.readByte(MPU9250_ADDRESS, INT_STATUS) & 0x01)
  {  
    myIMU.readAccelData(myIMU.accelCount);  // Read the x/y/z adc values
    myIMU.getAres();

    // Now we'll calculate the accleration value into actual g's
    // This depends on scale being set
    myIMU.ax = (float)myIMU.accelCount[0]*myIMU.aRes;// - accelBias[0];
    myIMU.ay = (float)myIMU.accelCount[1]*myIMU.aRes;// - accelBias[1];
    myIMU.az = (float)myIMU.accelCount[2]*myIMU.aRes;// - accelBias[2];

    myIMU.readGyroData(myIMU.gyroCount);  // Read the x/y/z adc values
    myIMU.getGres();

    // Calculate the gyro value into actual degrees per second
    // This depends on scale being set
    myIMU.gx = (float)myIMU.gyroCount[0]*myIMU.gRes;
    myIMU.gy = (float)myIMU.gyroCount[1]*myIMU.gRes;
    myIMU.gz = (float)myIMU.gyroCount[2]*myIMU.gRes;

    myIMU.readMagData(myIMU.magCount);  // Read the x/y/z adc values
    myIMU.getMres();
    // User environmental x-axis correction in milliGauss, should be
    // automatically calculated
    myIMU.magbias[0] = +470.;
    // User environmental x-axis correction in milliGauss TODO axis??
    myIMU.magbias[1] = +120.;
    // User environmental x-axis correction in milliGauss
    myIMU.magbias[2] = +125.;

    // Calculate the magnetometer values in milliGauss
    // Include factory calibration per data sheet and user environmental
    // corrections
    // Get actual magnetometer value, this depends on scale being set
    myIMU.mx = (float)myIMU.magCount[0]*myIMU.mRes*myIMU.magCalibration[0] - myIMU.magbias[0];
    myIMU.my = (float)myIMU.magCount[1]*myIMU.mRes*myIMU.magCalibration[1] - myIMU.magbias[1];
    myIMU.mz = (float)myIMU.magCount[2]*myIMU.mRes*myIMU.magCalibration[2] - myIMU.magbias[2];
  } // if (readByte(MPU9250_ADDRESS, INT_STATUS) & 0x01)

  // Must be called before updating quaternions!
  myIMU.updateTime();

  // Sensors x (y)-axis of the accelerometer is aligned with the y (x)-axis of
  // the magnetometer; the magnetometer z-axis (+ down) is opposite to z-axis
  // (+ up) of accelerometer and gyro! We have to make some allowance for this
  // orientationmismatch in feeding the output to the quaternion filter. For the
  // MPU-9250, we have chosen a magnetic rotation that keeps the sensor forward
  // along the x-axis just like in the LSM9DS0 sensor. This rotation can be
  // modified to allow any convenient orientation convention. This is ok by
  // aircraft orientation standards! Pass gyro rate as rad/s
  //  MadgwickQuaternionUpdate(ax, ay, az, gx*PI/180.0f, gy*PI/180.0f, gz*PI/180.0f,  my,  mx, mz);
    myIMU.delt_t = millis() - myIMU.count;
    if (myIMU.delt_t > 500)
    {
      // Print acceleration values in milligs!
      xAccelValueNew = 1000*myIMU.ax;
      yAccelValueNew = 1000*myIMU.ay;
      zAccelValueNew = 1000*myIMU.az;
      xGyroValueNew = myIMU.gx;
      yGyroValueNew = myIMU.gy;
      zGyroValueNew = myIMU.gz;
      xMagValueNew = myIMU.mx;
      yMagValueNew = myIMU.my;
      zMagValueNew = myIMU.mz;

      myIMU.tempCount = myIMU.readTempData();  // Read the adc values
      // Temperature in degrees Centigrade
      myIMU.temperature = (((float) myIMU.tempCount) / 333.87 + 21.0) * 9/5 + 31;
      
      // Print temperature in degrees Centigrade
      tempurature2ValueNew = myIMU.temperature;

      myIMU.count = millis();
    }             
  
}

void setup() {
  Serial.begin(115200);
  compass.initialize();
  /* Initialise the sensor */
  if(!bmp.begin())
  {
    /* There was a problem detecting the BMP085 ... check your connections */
    Serial.print("Ooops, no BMP085 detected ... Check your wiring or I2C ADDR!");
  }
  byte c = myIMU.readByte(MPU9250_ADDRESS, WHO_AM_I_MPU9250);
  Serial.print("MPU9250 "); Serial.print("I AM "); Serial.print(c, HEX);
  Serial.print(" I should be "); Serial.println(0x73, HEX);
  if (c == 0x73) // WHO_AM_I should always be 0x68
  {
    Serial.println("MPU9250 is online...");

    // Start by performing self test and reporting values
    myIMU.MPU9250SelfTest(myIMU.SelfTest);
    Serial.print("x-axis self test: acceleration trim within : ");
    Serial.print(myIMU.SelfTest[0],1); Serial.println("% of factory value");
    Serial.print("y-axis self test: acceleration trim within : ");
    Serial.print(myIMU.SelfTest[1],1); Serial.println("% of factory value");
    Serial.print("z-axis self test: acceleration trim within : ");
    Serial.print(myIMU.SelfTest[2],1); Serial.println("% of factory value");
    Serial.print("x-axis self test: gyration trim within : ");
    Serial.print(myIMU.SelfTest[3],1); Serial.println("% of factory value");
    Serial.print("y-axis self test: gyration trim within : ");
    Serial.print(myIMU.SelfTest[4],1); Serial.println("% of factory value");
    Serial.print("z-axis self test: gyration trim within : ");
    Serial.print(myIMU.SelfTest[5],1); Serial.println("% of factory value");

    // Calibrate gyro and accelerometers, load biases in bias registers
    myIMU.calibrateMPU9250(myIMU.gyroBias, myIMU.accelBias);
    
    myIMU.initMPU9250();
    // Initialize device for active mode read of acclerometer, gyroscope, and
    // temperature
    Serial.println("MPU9250 initialized for active data mode....");

    // Read the WHO_AM_I register of the magnetometer, this is a good test of
    // communication
    byte d = myIMU.readByte(AK8963_ADDRESS, WHO_AM_I_AK8963);
    Serial.print("AK8963 "); Serial.print("I AM "); Serial.print(d, HEX);
    Serial.print(" I should be "); Serial.println(0x48, HEX);
  
    // Get magnetometer calibration from AK8963 ROM
    myIMU.initAK8963(myIMU.magCalibration);
    // Initialize device for active mode read of magnetometer
    Serial.println("AK8963 initialized for active data mode....");
    //  Serial.println("Calibration values: ");
    Serial.print("X-Axis sensitivity adjustment value ");
    Serial.println(myIMU.magCalibration[0], 2);
    Serial.print("Y-Axis sensitivity adjustment value ");
    Serial.println(myIMU.magCalibration[1], 2);
    Serial.print("Z-Axis sensitivity adjustment value ");
    Serial.println(myIMU.magCalibration[2], 2);
  }
}
TimedAction ping1Read = TimedAction(0.01, readPing1);
TimedAction ping2Read = TimedAction(0.01, readPing2);
TimedAction ping3Read = TimedAction(0.01, readPing3);
TimedAction ping4Read = TimedAction(0.01, readPing4);
TimedAction radio1Read = TimedAction(0.01, readRadio1);
TimedAction radio2Read = TimedAction(0.01, readRadio2);
TimedAction radio3Read = TimedAction(0.01, readRadio3);
TimedAction radio4Read = TimedAction(0.01, readRadio4);
TimedAction compass1Read = TimedAction(0.1, readCompass1);
TimedAction temperatureRead = TimedAction(0.1, readTempAndPressure);
//TimedAction gyroRead = TimedAction(1, readGyro);

void loop()
{
  ping1Read.check();
  ping2Read.check();
  ping3Read.check();
  ping4Read.check();
  radio1Read.check();
  radio2Read.check();
  radio3Read.check();
  radio4Read.check();
  compass1Read.check();
  temperatureRead.check();
  //gyroRead.check();
  String returnString = "{active:true";


  if(tempuratureValue != tempuratureValueNew) {
    tempuratureValue = tempuratureValueNew;
    returnString += ",tempurature:";
    returnString += tempuratureValue;
  }
  if(tempurature2Value != tempurature2ValueNew) {
    tempurature2Value = tempurature2ValueNew;
    returnString += ",tempurature2:";
    returnString += tempurature2Value;
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
    returnString += ",rearDistance:";
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
  /*
  if(xAccelValue != xAccelValueNew) {
    xAccelValue = xAccelValueNew;
    returnString += ",accelX:";
    returnString += xAccelValue;
  }
  if(yAccelValue != yAccelValueNew) {
    yAccelValue = yAccelValueNew;
    returnString += ",accelY:";
    returnString += yAccelValue;
  }
  if(zAccelValue != zAccelValueNew) {
    zAccelValue = zAccelValueNew;
    returnString += ",accelZ:";
    returnString += zAccelValue;
  }
  if(xGyroValue != xGyroValueNew) {
    xGyroValue = xGyroValueNew;
    returnString += ",gyroX:";
    returnString += xGyroValue;
  }
  if(yGyroValue != yGyroValueNew) {
    yGyroValue = yGyroValueNew;
    returnString += ",gyroY:";
    returnString += yGyroValue;
  }
  if(zGyroValue != zGyroValueNew) {
    zGyroValue = zGyroValueNew;
    returnString += ",gyroZ:";
    returnString += zGyroValue;
  }
  if(xMagValue != xMagValueNew) {
    xMagValue = xMagValueNew;
    returnString += ",magX:";
    returnString += xMagValue;
  }
  if(yMagValue != yMagValueNew) {
    yMagValue = yMagValueNew;
    returnString += ",magY:";
    returnString += yMagValue;
  }
  if(zMagValue != zMagValueNew) {
    zMagValue = zMagValueNew;
    returnString += ",magZ:";
    returnString += zMagValue;
  }
  */
  
  if(returnString != "{active:true") {
    Serial.println(returnString + ",end:true}");
    returnString = "";
  }

}
