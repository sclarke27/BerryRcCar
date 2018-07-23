const SerialController = require('./SerialController');
const ByteUtils = require('../ByteUtils');
/**
 * Simple utility used to communicate with a Pololu Maestro Servo Controller over a serial connection
 */
class MaestroController extends SerialController {
    /**
     * class constructor
     * @param {boolean} softwareDebugEnabled - (optional) disables communication on serial port 
     */
    constructor(softwareDebugEnabled = false) {
      super(softwareDebugEnabled);
    }

    reset() {
      this._port.write([ 0xA2 ]);
    }

    set8BitTarget(channel, target, onComplete) {
      if(target < 0 || target > 254) {
        console.error("PololuMaestro", "8 bit target value should be 0-254, was:", target);
    
        return;
      }
    
      // console.debug("PololuMaestro", "Setting channel", channel, "8 bit target to", target, "microseconds");
      this._send8BitCommand(0xFF, channel, target, onComplete);
    }

    setTarget(channel, us, onComplete) {
      if(us < 640 || us > 2304) {
        console.error("PololuMaestro", "target value should be 640-2304 microseconds, was: ", us);
    
        return;
      }
    
      // console.debug("PololuMaestro", "Setting channel", channel, "target to", us, "microseconds");
      this._sendCommand(0x84, channel, us * 4, onComplete);
    };    

    //^ Internal methods
    _sendCommand(command, channel, value, onComplete) {
      this._port.write([ command, channel ].concat(ByteUtils.toLowAndHighBits(value)), onComplete);
    }

    _send8BitCommand(command, channel, value, onComplete) {
      this._port.write([ command, channel, value ], onComplete);
    }

    stopScript() {
	    this._port.write([ 0xA4 ]);
    };

    restartScriptAtSubroutine(subroutineNumber) {
      this._port.write([ 0xA7, subroutineNumber]);
    };

    restartScriptAtSubroutineWithParameter(subroutineNumber, parameter) {
      if(parameter < 0 || parameter > 16383) {
        LOG.error("PololuMaestro", "Subroutine parameter must be in the range 0-16383");
        return;
      }

      this._port.write([ 0xA8, subroutineNumber].concat(ByteUtils.toLowAndHighBits(parameter)));
    };

}

module.exports = MaestroController;
