const net = require('net');

class Servos {
  constructor(steeringPort, throttlePort, softwareDebugEnabled) {
    this._steeringPort = steeringPort;
    this._throttlePort = throttlePort;
    this._throttleStatus = null;
    this._steeringStatus = null;
    this._softwareDebug = softwareDebugEnabled;
	this._steeringSocket = null;
	this._throttleSocket = null;
  }

  startSockets() {
	if(!this._softwareDebug) {
		const port1 = this._steeringPort;
		const port2 = this._throttlePort;

		this._steeringSocket = new net.Socket();
		this._throttleSocket = new net.Socket();

		this._steeringSocket.connect(port1, function () {
			console.log(`steering socket connected on port ${port1}`);
		});
		this._throttleSocket.connect(port2, function () {
			console.log(`throttle socket connected on port ${port2}`);
		});
	}      
  }
  
  sendSteeringMsg(msg) {
    if(!this._softwareDebug) {
      this._steeringSocket.connect(this._steeringPort, () => {
        this._steeringSocket.end(msg);
      });
    } else {
      console.log('steering msg', msg);
    }
  }

  sendThrottleMsg(msg) {
    if(!this._softwareDebug) {
      this._throttleSocket.connect(this._throttlePort, () => {
        this._throttleSocket.end(msg);
      });
    } else {
      console.log('throttle msg', msg);
    }
  }
}

module.exports = Servos;
