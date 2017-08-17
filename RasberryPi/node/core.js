'use strict';

const ArduinoPort = require('./ArduinoPort');
const Sensors = require('./Sensors');
const Servos = require('./Servos');
const BotActions = require('./BotActions');
const HttpServer = require('./HttpServer');

class BotCore {
  constructor() {
    this._steeringPort = 2001;
    this._throttlePort = 2002;
    this._arduinoBaud = 11520;
    this._httpPort = 8080;
    this._arduino = null;
    this._sensors = null;
    this._servos = null;
    this._mainLoop = null;
    this._softwareDebug = true;
    this._botActions = null;
    this._httpServer = null;
  }

  startMain() {
    this._sensors = new Sensors();
    this._servos = new Servos(this._steeringPort, this._throttlePort, this._softwareDebug);
    this._arduino = new ArduinoPort(this._softwareDebug);
    this._botActions = new BotActions(this._servos, this._sensors);
    this._httpServer = new HttpServer(this._httpPort, this._botActions, this._sensors);
    if(!this._softwareDebug) {
      this._arduino.startPort(this._arduinoBaud);
    }
    this._arduino.setDataHandler(this._sensors.setSensorDataSet);
    this._httpServer.startHttpServer();
    this._botActions.wakeUp();
    this._mainLoop = setInterval(this.main.bind(this), 10);
  }

  main() {
    this._botActions.handleRawData();
  }
}

const otherBarry = new BotCore();
otherBarry.startMain();
