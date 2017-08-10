'use strict';

const ArduinoPort = require('./ArduinoPort');
const Sensors = require('./Sensors');
const Servos = require('./Servos');


class BotCore {
  constructor() {
    this._steeringPort = 2001;
    this._throttlePort = 2002;
    this._arduinoBaud = 11520;
    this._arduino = null;
    this._sensors = null;
    this._servos = null;
    this._movementStatus = null;
    this._steeringStatus = null;
    this._mainLoop = null;
  }

  start() {
    this._sensors = new Sensors();
    this._servos = new Servos(this._steeringPort, this._throttlePort);
    this._arduino = new ArduinoPort();

    this._arduino.startPort(this._arduinoBaud);
    this._arduino.setDataHandler(this._sensors.setSensorDataSet);
    this._mainLoop = setInterval(this.main.bind(this), 10);
  }

  main() {
    console.log(this._sensors);
    const sensorData = this._sensors.getSensorDataSet();

    if(sensorData.rc1 <= -100) {
      if(this._movementStatus != 'forward') {
        this._servos.sendThrottleMsg('forward');
        this._movementStatus = 'forward';
      }
    } else if(sensorData.rc1 >= 100) {
      if(this._movementStatus != 'reverse') {
        this._servos.sendThrottleMsg('reverse');
        this._movementStatus = 'reverse';
      }
    } else {
      if(this._movementStatus != 'stop') {
        this._servos.sendThrottleMsg('stop');
        this._movementStatus = 'stop';
      }
    }

    if(sensorData.rc2 <= -100) {
      if(this._steeringStatus != 'left') {
        this._servos.sendSteeringMsg('left');
        this._steeringStatus = 'left';
      }
    } else if(sensorData.rc2 >= 100) {
      if(this._steeringStatus != 'right') {
        this._servos.sendSteeringMsg('right');
        this._steeringStatus = 'right';
      }
    } else {
      if(this._steeringStatus != 'center') {
        this._servos.sendSteeringMsg('center');
        this._steeringStatus = 'center';
      }
    }
  }
}

const otherBarry = new BotCore();
otherBarry.start();
