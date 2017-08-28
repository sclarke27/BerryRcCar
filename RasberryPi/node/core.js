'use strict';
const mongojs = require('mongojs');
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
    this._httpServer = null;
	this._databaseUrl = "otherbarry";
	this._collections = ["botData", "botStatus"]
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
    this._sensors = new Sensors(this._db);
    this._servos = new Servos(this._steeringPort, this._throttlePort, true);
    this._servos.startSockets
    this._arduino = new ArduinoPort(this._softwareDebug);
    this._botActions = new BotActions(this._servos, this._sensors);
    if(!this._softwareDebug) {
		
		this._arduino.startPort(this._arduinoBaud);
    }
    this._arduino.setDataHandler(this._sensors.setSensorDataSet.bind(this._sensors));
    
    setTimeout(() => {
		this._botActions.wakeUp();    
		
		setInterval(() => {
		  otherBarry.main();
		},10);
	}, 500)
    //setTimeout(this._servos.startSockets.bind(this), 500);
    
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
otherBarry.startDBConnection() ;
otherBarry.startBot();
otherBarry.startHttp();
