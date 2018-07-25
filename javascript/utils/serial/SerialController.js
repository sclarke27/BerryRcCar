const Log = require('../Log');
/**
 * Base class used for communicating with hardware over serial connections
 */
class SerialController {
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
            
            // const parser = _serialPort.pipe(new Readline());
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
                Log.info(`Open Serial controller on ${serialAddress}`);
                this._port = new this._serialPort(serialAddress, {
                    baudRate: 115200
                });
                this._parser = this._port.pipe(new this._readline());
                this._parser.on('open', this.onConnectionOpened.bind(this));
                this._parser.on('error', this.onError.bind(this));
                this._parser.on('data', this.onData.bind(this));

              } catch (err) {
                Log.info(err);
            }
        }
        this._updateInterval = setInterval(this.handleCommandBuffer.bind(this), 5);
    }

    handleCommandBuffer() {
      if(this._commandBuffer.length > 0 && !this._sendingMessage) {
        this._sendingMessage = true;
        const currCommand = this._commandBuffer.shift();
        this.writeMessage(currCommand);
      }
    }

    writeMessage(msg) {
      //no-op
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
      if (typeof this._dataHandler === 'function') {
          this._dataHandler(data);
      }
    }

    /**
     * Event handler for when serial connection is opened
     * @param {string} msg 
     */
    onConnectionOpened(msg) {
      Log.info('Serial controller connection opened.', msg);
    }

    /**
     * Event Handler for when there is an error on the serial port
     * @param {string} err 
     */
    onError(err) {
        Log.info('Serial controller connection error:', err.message);
    }

}

module.exports = SerialController;
