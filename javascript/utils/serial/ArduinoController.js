const Log = require('../Log');
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
    Log.info('Arduino connection opened.', msg);
  }

  onError(err) {
    super.onError(err);
    Log.info('Arduino connection error:', err.message);
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
          Log.info('write complete');
          this._sendingMessage = false;
        })
      });
    } catch (err) {
      // Log.info(err);
    }
  }

}

module.exports = ArduinoController;