'use strict';
const mongojs = require('mongojs');
const ArduinoPort = require('./ArduinoPort');
const Sensors = require('./Sensors');
const BotActions = require('./BotActions');
const BotState = require('./BotState');
const BotIntents = require('./BotIntents');
const HttpServer = require('./HttpServer');
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();
myEmitter.on('event', () => {
  console.log('an event occurred!');
});


class BotCore {
  constructor() {
    this._steeringPort = 8186;
    this._throttlePort = 8185;
    this._arduinoBaud = 115200;
    this._httpPort = 8080;
    this._arduino = null;
    this._sensors = null;
    this._servos = null;
    this._mainLoop = null;
    this._softwareDebug = false;
    this._botActions = null;
    this._botState = null;
    this._httpServer = null;
    this._databaseUrl = "otherbarry";
    this._collections = ["botData", "botState"]
    this._db = null;
  }

  startDBConnection() {
    this._db = mongojs(this._databaseUrl, this._collections);
    this._db.on('error', function (err) {
      console.log('database error', err)
    })

    this._db.on('connect', function () {
      console.log('database connected')
    })

  }

  startBot() {
    this._arduino = new ArduinoPort(this._softwareDebug);
    this._botState = new BotState(this._db);
    this._sensors = new Sensors(this._db, this._botState);
    this._botActions = new BotActions(this._sensors, this._botState);
    if (!this._softwareDebug) {
      this._arduino.startPort(this._arduinoBaud);
    }
    this._arduino.setDataHandler(this._sensors.setSensorDataSet.bind(this._sensors));

    setInterval(() => {
      otherBarry.main();
    }, 1);

  }

  startHttp() {
    this._httpServer = new HttpServer(this._httpPort, this._botActions, this._sensors);
    this._httpServer.startHttpServer();
  }

  start() {
    this.startDBConnection();
    this.startBot();
    this.startHttp();
    this._sensors.setHttpServer(this._httpServer);
    this._botActions.changeIntent(BotIntents.startUp);
  }

  main() {
    if (this._botActions) {
      this._botActions.handleTick(this._sensors);
    }
  }
}

const otherBarry = new BotCore();
otherBarry.start();