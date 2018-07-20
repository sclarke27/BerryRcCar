const SerialController = require('./SerialController');

class ArduinoController extends SerialController {
  constructor(softwareDebugEnabled = false) {
    super(softwareDebugEnabled);
  }

  onData(data) {
    // console.info('from arduino', data.toString());
    super.onData(data);
  }

  onConnectionOpened(msg) {
    super.onConnectionOpened(msg);
    console.log('Arduino connection opened.', msg);
  }

  onError(err) {
    super.onError(err);
    console.log('Arduino connection error:', err.message);
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

}

module.exports = ArduinoController;