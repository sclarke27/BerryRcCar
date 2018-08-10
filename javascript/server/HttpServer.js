const Log = require('../utils/Log');
const express = require('express');
const http = require('http').Server(express);

const path = require('path');
const exphbs = require('express-handlebars');
const BotIntents = require('../bot/BotIntents');

// const WebSocketServer = require('websocket').server;
const WebSocket = require('ws');
const client = require('swim-client-js');
const swim = new client.Client({
  sendBufferSize: 1024 * 1024
});

/**
 * [_sensorData description]
 * @type {Object}
 */
class HttpServer {
  constructor(httpConfig, botActions, sensors, showDebug = true) {
    this.config = httpConfig;
    this.port = this.config.hostPort;
    this.server = null;
    this.botActions = botActions;
    this.sensors = sensors;
    this.config = httpConfig;
    this.port = this.config.hostPort;
    this.botName = this.config.botName;
    this.server = null;
    this.webApp = null;
    this.showDebug = showDebug;
    this.hbsHelpers = null;
    this.main = null;
		this.hostUrl = this.config.hostUrl;
		this.swimPort = this.config.swimPort;
		this.fullHostUrl = 'http://' + this.hostUrl + ((this.port !== 80) ? (':' + this.port) : '');
    this.fullSwimUrl = 'ws://' + this.hostUrl + ':' + this.swimPort;
    this.fullAggUrl = 'http://' + this.config.aggregateHost + ((this.port !== 80) ? (':' + this.port) : '');
    this.fullAggSwimUrl = 'ws://' + this.config.aggregateHost + ':5620';
    this.clients = [];
    this.swimClient = swim;
    
  }

  /**
   * start up http server and setup exress
   */
  setUpEngine() {
    this.webApp = express();
    this.webApp.engine('.hbs', exphbs({
      defaultLayout: 'main',
      extname: '.hbs',
      layoutsDir: path.join(__dirname, 'views/layouts')
    }));
    this.webApp.set('view engine', '.hbs');
    this.webApp.set('views', path.join(__dirname, 'views'));
    this.webApp.use('/js', express.static(path.join(__dirname + '/views/js')));
    this.webApp.use('/css', express.static(path.join(__dirname + '/views/css')));
    this.webApp.use('/assets', express.static(path.join(__dirname + '/views/assets')));

    this.server = require('http').Server(this.webApp);

    const leftEyeSocket = new WebSocket.Server({ port: 8090 });
    const rightEyeSocket = new WebSocket.Server({ port: 8091 });
    let isLeftEyeBroadcastingMsg = false;
    let isRightEyeBroadcastingMsg = false;
    // Broadcast to all.
    leftEyeSocket.broadcast = (data) => {
      if(!isLeftEyeBroadcastingMsg) {
        isLeftEyeBroadcastingMsg = true;
        leftEyeSocket.clients.forEach(function each(client) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(data);
          }
        });
        isLeftEyeBroadcastingMsg = false;
      }
    };    
    rightEyeSocket.broadcast = (data) => {
      if(!isRightEyeBroadcastingMsg) {
        isRightEyeBroadcastingMsg = true;
        rightEyeSocket.clients.forEach(function each(client) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(data);
          }
        });
        isRightEyeBroadcastingMsg = false;
      }
    };    

    leftEyeSocket.on('connection', function connection(ws) {
      Log.info(`websocket client connected to left eye socket`);
    });    

    rightEyeSocket.on('connection', function connection(ws) {
      Log.info(`websocket client connected to right eye socket`);
    });    

    this.swimClient.downlinkValue()
      .host(`ws://127.0.0.1:5620`)
      .node('/image/leftEye')
      .lane('rawImage')
      .didSet((newValue) => {
        if(!isLeftEyeBroadcastingMsg) {
          leftEyeSocket.broadcast(newValue);
        }
      })
      .open();    

      this.swimClient.downlinkValue()
      .host(`ws://127.0.0.1:5620`)
      .node('/image/rightEye')
      .lane('rawImage')
      .didSet((newValue) => {
        if(!isRightEyeBroadcastingMsg) {
          rightEyeSocket.broadcast(newValue);
        }
      })
      .open();    

    // create our handlebars helpers
    this.hbsHelpers = {
      'if_eq': (a, b, opts) => {
          if (a == b) {
              return opts.fn(this);
          } else {
              return opts.inverse(this);
          }
      },
      'if_not_eq': (a, b, opts) => {
          if (a != b) {
              return opts.fn(this);
          } else {
              return opts.inverse(this);
          }
      },
    };    

  }

  /**
   * 
   */
  sendSocketMessage(messageKey, messageData) {
    this.io.emit(messageKey, messageData);
  }

  /**
   * route to handle sensor data I/O
   */
  // createSensorsRoute() {
  //   this.webApp.route('/sensor/:channel-:newValue')
  //     .get((request, response) => {
  //       const reqParams = request.params;
  //       const channel = reqParams.channel;
  //       const sensorData = this.sensors.getSensorDataSet();
  //       response.json({
  //         name: channel,
  //         value: sensorData[channel],
  //       });
  //     })
  //     .post((request, response) => {
  //       const reqParams = request.params;
  //       const channel = reqParams.channel;
  //       const newValue = reqParams.newValue;
  //       this.sensors.setDataValue(channel, newValue);
  //       const sensorData = this.sensors.getSensorDataSet();
  //       const botStatus = this.botActions.getBotStatus();
  //       response.json({
  //         data: sensorData,
  //         status: botStatus,
  //       })
  //     })
  // }

  /**
   * Route to handle bot status message
   */
  // createStatusRoute() {
  //   this.webApp.route('/status')
  //     .get((request, response) => {
  //       const sensorData = this.sensors.getSensorDataSet();
  //       const botStatus = this.botActions.getBotStatus();
  //       response.json({
  //         data: sensorData,
  //         status: botStatus,
  //       })
  //     })
  //     .post((request, response) => {
  //       const sensorData = this.sensors.getSensorDataSet();
  //       const botStatus = this.botActions.getBotStatus();
  //       response.json({
  //         data: sensorData,
  //         status: botStatus,
  //       })
  //     })
  // }

  /**
   * Route to handle bot status message
   */
  // createIntentRoute() {
  //   this.webApp.route('/intent/:newIntent')
  //     .post((request, response) => {
  //       const newIntent = request.params.newIntent;
  //       this.botActions.changeIntent(String(newIntent));
  //       response.json({
  //         status: 'complete'
  //       })
  //     })
  // }


  /**
   * Route to handle bot status message
   */
  // createResetSensorRoute() {
  //   this.webApp.route('/resetSensors')
  //     .post((request, response) => {
  //       this.botActions.resetSensors()
  //       response.json({
  //         status: 'complete'
  //       })
  //     })
  // }

  /**
   * route to handle main page user sees in browser
   */
  createHomeRoute() {
    this.webApp.get('/', (request, response) => {
      // const sensorData = this.sensors.getSensorDataSet();
      // const botStatus = this.botActions.getBotStatus();
      // const sensorKeys = this.sensors.getSensorKeys();

      response.render('home', {
        // data: sensorData,
        // status: botStatus,
        // sensors: this.sensors.getSensorDataSet(),
        // intents: BotIntents,
        routeName: 'home',
        // sensorKeys: sensorKeys,
        botName: this.botName,
        fullHostUrl: this.fullHostUrl,
        fullSwimUrl: this.fullSwimUrl,
        helpers: this.hbsHelpers        
      })
    })
  }

  /**
   * route to handle dashboard page user sees in browser
   */
  createDashRoute() {
    this.webApp.get('/dash', (request, response) => {
      // const sensorData = this.sensors.getSensorDataSet();
      // const botStatus = this.botActions.getBotStatus();
      // const sensorKeys = this.sensors.getSensorKeys();

      response.render('dash', {
        // data: sensorData,
        // status: botStatus,
        // sensorKeys: sensorKeys,
        // sensors: this.sensors.getSensorDataSet(),
        // intents: BotIntents,
        routeName: 'dash',
        botName: this.botName,
        fullHostUrl: this.fullHostUrl,
        fullSwimUrl: this.fullSwimUrl,
        helpers: this.hbsHelpers         
      })
    })
  }

  /**
   * route to handle phone page user sees in browser
   */
  createPhoneRoute() {
    this.webApp.get('/phone', (request, response) => {
      // const sensorData = this.sensors.getSensorDataSet();
      // const botStatus = this.botActions.getBotStatus();
      // const sensorKeys = this.sensors.getSensorKeys();

      response.render('phone', {
        // data: sensorData,
        // status: botStatus,
        // sensorKeys: sensorKeys,
        // sensors: this.sensors.getSensorDataSet(),
        // intents: BotIntents,
        routeName: 'phone',
        botName: this.botName,
        hostUrl: this.hostUrl,
        fullHostUrl: this.fullHostUrl,
        fullSwimUrl: this.fullSwimUrl,
        helpers: this.hbsHelpers         
      })
    })
  }


  /**
   * server error handler
   * @param  {[Object]} err [message object]
   */
  onServerStarted(err) {
    if (err) {
      Log.error('http server error', err);
    }
    Log.info(`express server listening on ${this.port}`);
  }

  startHttpServer(mainThread) {
    this.main = mainThread;
    this.setUpEngine();
    this.createHomeRoute();
    // this.createStatusRoute();
    // this.createSensorsRoute();
    // this.createIntentRoute();
    // this.createResetSensorRoute();
    this.createPhoneRoute();
    this.createDashRoute();

    this.server.listen(this.port, this.onServerStarted.bind(this));

  }


}

module.exports = HttpServer;