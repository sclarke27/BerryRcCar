const net = require('net');

class Servos {
  constructor({steeringPort, throttlePort}) {
    this._steeringPort = steeringPort;
    this._throttlePort = throttlePort;
    this._throttleStatus = null;
    this._steeringStatus = null;
    this._steeringSocket = new net.Socket({
      allowHalfOpen: false
    });
    this._throttleSocket = new net.Socket({
      allowHalfOpen: false
    });
  }

  sendSteeringMsg(msg) {
    this._steeringSocket.connect(this._steeringPort, function () {
      console.log('steering msg', msg);
      this._steeringSocket.end(msg);
    });
  }

  sendThrottleMsg(msg) {
    this._throttleSocket.connect(this._throttlePort, function () {
      console.log('throttle msg', msg);
      this._throttleSocket.end(msg);
    });
  }
}

module.exports = Servos;
