const net = require('net');

class Servos {
  constructor(steeringPort, throttlePort, softwareDebugEnabled) {
    this._steeringPort = steeringPort;
    this._throttlePort = throttlePort;
    this._throttleStatus = null;
    this._steeringStatus = null;
    this._softwareDebug = softwareDebugEnabled;

    if(!this._softwareDebug) {
      this._steeringSocket = new net.Socket({
        allowHalfOpen: false
      });
      this._throttleSocket = new net.Socket({
        allowHalfOpen: false
      });
    }
  }

  sendSteeringMsg(msg) {
    if(!this._softwareDebug) {
      this._steeringSocket.connect(this._steeringPort, function () {
        this._steeringSocket.end(msg);
      });
    } else {
      console.log('steering msg', msg);
    }
  }

  sendThrottleMsg(msg) {
    if(!this._softwareDebug) {
      this._throttleSocket.connect(this._throttlePort, function () {
        this._throttleSocket.end(msg);
      });
    } else {
      console.log('throttle msg', msg);
    }
  }
}

module.exports = Servos;
