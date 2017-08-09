/**
 * [baud description]
 * @type {[type]}
 */
class ArduinoPort {
  constructor() {
    this._serialPort = require('serialport');
    this._readline = SerialPort.parsers.Readline;
    this._port = null;
    this._parser = new Readline();
    this._dataHandler = null;
  }

  startPort(baud = 11520) {
    try {
      this._port = new SerialPort('/dev/ttyACM0', {
        baudRate: baud
      });
      this._port.pipe(this._parser);

      this._port.on('open', this.onConnectionOpened);
      this._port.on('error', this.onError);
      parser.on('data', this.onData);
    }
    catch(err) {
      console.log(err);
    }
  }

  setDataHandler(handler) {
    this._dataHandler = handler;
  }

  onData(data) {
    if(typeof this.onData === 'function') {
      this._dataHandler(data);
    }
  }

  onConnectionOpened(msg) {
    console.log('Arduino connection opened.', msg);
  }

  onError(err) {
    console.log('Arduino connection error:', err.message);
  }

}

module.exports = ArduinoPort;
