'use strict';

const ArduinoPort = require('./ArduinoPort');
const Sensors = require('./Sensors');
const Servos = require('./Servos');
const BotActions = require('./BotActions');
const HttpServer = require('./HttpServer');
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();
myEmitter.on('event', () => {
  console.log('an event occurred!');
});


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

  startBot() {
    this._sensors = new Sensors();
    this._servos = new Servos(this._steeringPort, this._throttlePort, this._softwareDebug);
    this._arduino = new ArduinoPort(this._softwareDebug);
    this._botActions = new BotActions(this._servos, this._sensors);
    if(!this._softwareDebug) {
      this._arduino.startPort(this._arduinoBaud);
    }
    this._arduino.setDataHandler(this._sensors.setSensorDataSet);
    this._botActions.wakeUp();
    setInterval(() => {
      otherBarry.main();
    },10);
  }

  startHttp() {
    this._httpServer = new HttpServer(this._httpPort, this._botActions, this._sensors);
    this._httpServer.startHttpServer();
  }

  main() {
    if(this._botActions) {
      this._botActions.handleTick();
    }
    //this._botActions.handleRawData();
  }
}

const otherBarry = new BotCore();
otherBarry.startBot();
otherBarry.startHttp();
