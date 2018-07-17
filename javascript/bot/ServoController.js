
/**
 * # ByteUtils
 */

/**
 * The Maestro's data protocol sends low bits first, then high bits and sometimes
 * with only the first 7 bits used per byte.
 */
var ByteUtils = {
	// Pass a value, get an array back.
	// E.g. `6000` will be returned as `[01110000, 00101110]`
	toLowAndHighBits: function(value) {
		return [value & 0x7F, (value >> 7) & 0x7F];
	},

	// Pass an array, get an value back.
	// E.g. `[01110000, 00101110]` will be returned as `6000`
	fromLowAndHighBits: function(data) {
		return ((data[1] << 7) + data[0]) & 0x7F7F;
	},

	// Pass an array, get an value back.
	// E.g. `[01110000, 00010111]` will be returned as `6000`
	fromLowAndHigh8Bits: function(data) {
		return ((data[1] << 8) + data[0]) & 0xFFFF;
	}
}

/**
 * Simple utility used to communicate with an Arduino board over a serial connection
 */
class ServoController {
    /**
     * class constructor
     * @param {boolean} softwareDebugEnabled - (optional) disables communication on serial port 
     */
    constructor(softwareDebugEnabled = false) {
        this._softwareDebug = softwareDebugEnabled;
        this._port = null;
        this._dataHandler = null;
        this._commandBuffer = [];
        this._updateInterval = null;
        this._sendingMessage = false;
        if (!this._softwareDebug) {
            this._serialPort = require('serialport');
            this._readline = this._serialPort.parsers.Readline;
            this._parser = new this._readline();
        }
    }

    /**
     * 
     * @param {string} serialAddress - address of serial port for the board
     * @param {number} baud - baud rate to communicate at. Make sure this matches what the scripts on the arduino are communicating at.
     */
    startPort(serialAddress = '/dev/ttyACM0', baud = 115200) {
        if (!this._softwareDebug) {
            try {
                console.info(`Open servo controller on ${serialAddress}`);
                this._port = new this._serialPort(serialAddress, {
                    baudRate: 115200
                });

                this._port.on('open', this.onConnectionOpened.bind(this));
                this._port.on('error', this.onError.bind(this));
                this._port.on('data', this.onData.bind(this));

              } catch (err) {
                console.log(err);
            }
        }
        this._updateInterval = setInterval(this.handleCommandBuffer.bind(this), 1);
    }

    handleCommandBuffer() {
      if(this._commandBuffer.length > 0 && !this._sendingMessage) {
        this._sendingMessage = true;
        const currCommand = this._commandBuffer.shift();
        this.writeMessage(currCommand);
      }
    }

    setServoPos(num, pos = 8, ramp = 0) {
      // console.info(num, pos, ramp)
      if (pos > 180 || pos < 0) {
        console.error(`Servo position (${pos}) out of range. Input must be between 0 and 180.`);
      }

      if (ramp > 61 || ramp < 0) {
        console.error(`Ramp out of range. Must be between 0 and 61, ${ramp} sent.`);
      }

      const realPos = parseInt(pos * (1000.0/180.0) + 250.0);
      const commandStr = `${num}${ramp}${realPos%256}${Math.round(realPos/256)}`
      // const commandStr = '\x00\x00\xf4\x01'
      this.sendCommand(commandStr);
      //self.sendCommand(chr(num) + chr(ramp) + chr(realPos%256) + chr(realPos/256), 3)
    }

    sendCommand(cmdString) {
      // this.writeMessage('!SC' + cmdString + '\r'.charAt(0));
      this._commandBuffer.push('!SC' + cmdString + '\r'.charAt(0));
      // console.info(this._commandBuffer);
    }

    /**
     * write a message to the arduino over serial port
     * @param {string} msg 
     */
    writeMessage(msg) {
        try {
          // console.info(msg);
          this._port.write(msg, 'binary', () => {
            this._port.drain(() => {
              console.info('write complete');
              this._sendingMessage = false;
            })
          });
        } catch (err) {
          // console.log(err);
        }
    }

    /**
     * set the function which will handle message events from serial port
     * this is the hook for grabbing messages from the arduino
     * @param {function} handler 
     */
    setDataHandler(handler) {
        this._dataHandler = handler;
    }

    /**
     * event handler for receiving data over the serial port
     * @param {string} data 
     */
    onData(data) {
      // console.info('ondata', data)
      if (typeof this._dataHandler === 'function') {
          this._dataHandler(data);
      }
    }

    /**
     * Event handler for when serial connection is opened
     * @param {string} msg 
     */
    onConnectionOpened(msg) {
      this.sendCommand('SBR1');
      this._port.update({baudRate: 38400});
      console.info('port open and at 38k baud')
      console.log('Servo controller connection opened.', msg);
    }

    /**
     * Event Handler for when there is an error on the serial port
     * @param {string} err 
     */
    onError(err) {
        console.log('Servo controller connection error:', err.message);
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

}

module.exports = ServoController;
