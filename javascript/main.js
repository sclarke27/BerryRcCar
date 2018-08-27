const Log = require('./utils/Log');

Log.info('[main] Loading libraries ...');

const Sensors = require('./bot/Sensors');
const BotActions = require('./bot/BotActions');
const BotState = require('./bot/BotState');
const BotIntents = require('./bot/BotIntents');
const HttpServer = require('./server/HttpServer');
const EventEmitter = require('events');
const ArduinoController = require('./utils/serial/ArduinoController');
// const PythonShell = require('python-shell');
const MaestroController = require('./utils/serial/MaestroController');
const swim = require('swim-client-js');

// grab command line arguments
const commandLineArgs = process.argv

// const spawn = require('child_process').spawn;
// const subprocess = spawn('bad_command');

class Main {
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
        this._serviceConfig = null;
        this._args = {};
        this._servoController = null;
        this._swimClient = new swim.Client();
        this._mainLoopInterval = 1;

        this.processCommandLineArgs();
        this.loadConfig(this._args.config || 'localhost')

        if (this.showDebug) {
            Log.info('[main] constructed');
        }
        this._socket = null;

    }


    /**
     * Load up configuration values from config file
     * @param {*} configName 
     */
    loadConfig(configName) {
        if (this.showDebug) {
            Log.info('[main] load config');
        }
        // load config
        this._serviceConfig = require('../config/node/' + configName + 'Config.js');

        // toggle app debug output
        this.showDebug = this._serviceConfig.showDebug;

        if (this.showDebug) {
            Log.info('[main] config loaded');
        }
        // initialize the bots and services
        this.initialize();
    }

    /**
     * main initialization method. 
     */
    initialize() {
        if (this.showDebug) {
            Log.info('[main] initialize');
        }

    }

    /**
     * utility method to handle processing arguments from the command line
     * arguments will be stored in this.args
     */
    processCommandLineArgs() {
        commandLineArgs.forEach((val, index, arr) => {
            if (val.indexOf('=') > 0) {
                const rowValue = val.split('=');
                this._args[rowValue[0]] = rowValue[1];
            }
        })
    }

    startBot() {
        this.hostUrl = this._serviceConfig.hostUrl;
        this.swimPort = this._serviceConfig.swimPort;
        this.fullHostUrl = 'http://' + this.hostUrl + ((this.port !== 80) ? (':' + this.port) : '');
        this.fullSwimUrl = 'ws://' + this._serviceConfig.swimUrl + ':' + this.swimPort;

        this._botState = new BotState(this.fullSwimUrl);
        this._sensors = new Sensors(this.fullSwimUrl);
        this._sensors.start();

        this._servoController = new MaestroController(this._softwareDebug);
        this._servoController.startPort(this._serviceConfig.servoController.address, this._serviceConfig.servoController.baud);

        this._arduino = new ArduinoController(this._softwareDebug);
        this._arduino.startPort(this._serviceConfig.arduino.address, this._serviceConfig.arduino.baud);
        this._arduino.setDataHandler(this._sensors.setSensorDataSet.bind(this._sensors));

        this._botActions = new BotActions(this._sensors, this._botState, this._servoController, this._arduino);
        this._botActions.changeIntent(BotIntents.startUp);
        
        // initialize bot state swim service
        swim.command(this.fullSwimUrl, `/botState`, `setName`, this._serviceConfig.botName);

        // swim.command(this.fullSwimUrl, `/servo/tilt`, `setName`, 'tilt');
        // swim.command(this.fullSwimUrl, `/servo/pan`, `setName`, 'pan');
        // swim.command(this.fullSwimUrl, `/servo/steering`, `setName`, 'steering');
        // swim.command(this.fullSwimUrl, `/servo/throttle`, `setName`, 'throttle');

        setInterval(() => {
            otherBarry.main();
        }, this._mainLoopInterval);

    }

    startHttp() {
        this._httpServer = new HttpServer(this._serviceConfig, this._botActions, this._sensors, this.showDebug);
        this._httpServer.startHttpServer();
    }

    start() {
        // this.startDBConnection();
        if (this._serviceConfig.httpEnabled) {
            this.startHttp();
        }
        this.startBot();
    }

    main() {
        if (this._botActions) {
            this._botActions.handleTick(this._sensors, this._mainLoopInterval);
        }
    }
}

const otherBarry = new Main();
otherBarry.start();