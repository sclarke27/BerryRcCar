/**
 *
 * Digital Compass implemented with the Hitachi HM55B Magnetic Field sensor
 * module provided by Parallax.
 *
 * Based on original code by kiilo (kiilo@kiilo.org).
 *
 * By Per Ejeklint ejeklint@me.com
 *
*/

#ifndef HM55B_Compass_h
#define HM55B_Compass_h

#include <math.h>

class HM55B_Compass {
public:
    static const int NO_VALUE = 0xFFFF;
    
    HM55B_Compass(unsigned clockPin, unsigned enablePin, unsigned dataIOPin);
    
    void initialize();
    int read();
    
private:
    unsigned _clockPin;
    unsigned _enablePin;
    unsigned _dataIOPin;
    
    int x;
    int y;
    
    void shiftOut(unsigned value, unsigned count);
    int shiftIn(unsigned count);
};

#endif