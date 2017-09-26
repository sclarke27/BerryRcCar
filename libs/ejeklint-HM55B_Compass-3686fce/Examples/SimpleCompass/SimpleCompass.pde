/*
 * Simple compass example
 */

#include <HM55B_Compass.h>

// Create an instance of compass. Clock on pin 8, Enable on pin 9, dataIO on pin 10.
HM55B_Compass compass(8, 9, 10);

void setup() {
  Serial.begin(57600);
  // Initialize the module before first use.
  compass.initialize();
}

void loop() {
  // Read uncalibrated compass value. This takes ~45 ms.
  // Gives angle +/- 180° from north. Negative values to east,
  // positive to west.
  int angle = compass.read();
  // NO_VALUE will be returned if the measuring failed.
  if (angle == HM55B_Compass::NO_VALUE) {
    Serial.println("Uh-oh");
  }
  else {
    Serial.println(angle);
  }
}

