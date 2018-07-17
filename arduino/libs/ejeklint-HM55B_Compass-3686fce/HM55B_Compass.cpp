#if defined(ARDUINO) && ARDUINO >= 100
#include "Arduino.h"
#else
#include "WProgram.h"
#endif

#include <HM55B_Compass.h>

HM55B_Compass::HM55B_Compass(unsigned clockPin, unsigned enablePin, unsigned dataIOPin) {
    _clockPin = clockPin;
    _enablePin = enablePin;
    _dataIOPin = dataIOPin;
    pinMode(_enablePin, OUTPUT);
    pinMode(_clockPin, OUTPUT);
    pinMode(_dataIOPin, INPUT);
}

void HM55B_Compass::initialize() {
    pinMode(_dataIOPin, OUTPUT);
    digitalWrite(_enablePin, LOW);
    shiftOut(B0000, 4);
    digitalWrite(_enablePin, HIGH);
}

int HM55B_Compass::read() {
    // Send start measurement command
    digitalWrite(_enablePin, LOW);
    shiftOut(B1000, 4);
    digitalWrite(_enablePin, HIGH);

    // Wait 40 ms for the chip to complete measurement
    delay(40);

    digitalWrite(_enablePin, LOW);
    shiftOut(B1100, 4);

    int result = shiftIn(4);
    int angle = 0;
    if (result == 12) {
        // Read actual values
        int x = shiftIn(11);
        int y = shiftIn(11);
        // Angle is atan(-y/x)
        angle = 180 * (atan2(-1 * y, x) / M_PI);
    } else {
        angle = NO_VALUE;
    }

    // Release HM55B
    digitalWrite(_enablePin, HIGH);

    return angle;
}

// Private methods

void HM55B_Compass::shiftOut(unsigned value, unsigned count) {
    pinMode(_dataIOPin, OUTPUT);
    // Shift out 'count' bits, from bit 'count-1' to bit 0. MSB goes out first.
    while (count--) {
        digitalWrite(_clockPin, LOW);
        digitalWrite(_dataIOPin, bitRead(value, count) ? HIGH : LOW);
        digitalWrite(_clockPin, HIGH); 
        delayMicroseconds(1);
    }
}

int HM55B_Compass::shiftIn(unsigned count) {
    int result = 0;
    pinMode(_dataIOPin, INPUT);
    // Shift in 'count' number of bits, from bit 'count - 1' to bit 0. MSB comes first.
    while (count--) {
        digitalWrite(_clockPin, HIGH);
        delayMicroseconds(1);
        if (digitalRead(_dataIOPin) == HIGH)
            bitWrite(result, count, 1);

        digitalWrite(_clockPin, LOW);
        delayMicroseconds(1);
    }

    // If bit 11 is set it's a negative value. Adjust to 16 bit integer.
    if (bitRead(result, 10)) {
        result = 0xf800 | result; 
    }
    return result;
}
