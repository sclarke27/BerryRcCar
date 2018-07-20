const SerialController = require('./SerialController');

/**
 * Simple utility used to communicate with a Parallax Servo Controller over a serial connection
 */
class PscServoController extends SerialController {
    /**
     * class constructor
     * @param {boolean} softwareDebugEnabled - (optional) disables communication on serial port 
     */
    constructor(softwareDebugEnabled = false) {
      super(softwareDebugEnabled);
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
     * Event handler for when serial connection is opened
     * @param {string} msg 
     */
    onConnectionOpened(msg) {
      this.sendCommand('SBR1');
      this._port.update({baudRate: 38400});
      console.info('port open and at 38k baud')
      super.onConnectionOpened(msg);
    }

}

module.exports = PscServoController;
