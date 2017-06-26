const express = require('express');
const http = require('http').Server(express);

const path = require('path');
const exphbs = require('express-handlebars');
const BotIntents = require('./BotIntents');

/**
 * [_sensorData description]
 * @type {Object}
 */
class HttpServer {
  constructor(httpPort, botActions, sensors) {
    this._port = httpPort;
    this._server = null;
    this._botActions = botActions;
    this._sensors = sensors;
    this._webApp = null;
    this._io = null;
  }

  /**
   * start up http server and setup exress
   */
  setUpEngine() {
    this._webApp = express();
    this._webApp.engine('.hbs', exphbs({
      defaultLayout: 'main',
      extname: '.hbs',
      layoutsDir: path.join(__dirname, 'views/layouts')
    }));
    this._webApp.set('view engine', '.hbs');
    this._webApp.set('views', path.join(__dirname, 'views'));
    this._webApp.use('/js', express.static(path.join(__dirname + '/views/js')));
    this._webApp.use('/css', express.static(path.join(__dirname + '/views/css')));
    this._webApp.use('/assets', express.static(path.join(__dirname + '/views/assets')));

    this._server = require('http').Server(this._webApp);

    this._io = require('socket.io')(this._server);

    this._io.on('connection', (client) => {
      console.log('user socket connected');

      client.on('phoneMag', (data) => {
        if (this._sensors) {
          this._sensors.setDataValue('phoneMagX', data.x);
          this._sensors.setDataValue('phoneMagY', data.y);
          this._sensors.setDataValue('phoneMagZ', data.z);
        }
      });

      client.on('disconnect', () => {
        console.log('user disconnected');
      });
    })
  }

  /**
   * 
   */
  sendSocketMessage(messageKey, messageData) {
    this._io.emit(messageKey, messageData);
  }

  /**
   * reoute to handle sensor data I/O
   */
  createSensorsRoute() {
    this._webApp.route('/sensor/:channel-:newValue')
      .get((request, response) => {
        const reqParams = request.params;
        const channel = reqParams.channel;
        const sensorData = this._sensors.getSensorDataSet();
        response.json({
          name: channel,
          value: sensorData[channel],
        });
      })
      .post((request, response) => {
        const reqParams = request.params;
        const channel = reqParams.channel;
        const newValue = reqParams.newValue;
        this._sensors.setDataValue(channel, newValue);
        const sensorData = this._sensors.getSensorDataSet();
        const botStatus = this._botActions.getBotStatus();
        response.json({
          data: sensorData,
          status: botStatus,
        })
      })
  }

  /**
   * Route to handle bot status message
   */
  createStatusRoute() {
    this._webApp.route('/status')
      .get((request, response) => {
        const sensorData = this._sensors.getSensorDataSet();
        const botStatus = this._botActions.getBotStatus();
        response.json({
          data: sensorData,
          status: botStatus,
        })
      })
      .post((request, response) => {
        const sensorData = this._sensors.getSensorDataSet();
        const botStatus = this._botActions.getBotStatus();
        response.json({
          data: sensorData,
          status: botStatus,
        })
      })
  }

  /**
   * Route to handle bot status message
   */
  createIntentRoute() {
    this._webApp.route('/intent/:newIntent')
      .post((request, response) => {
        const newIntent = request.params.newIntent;
        this._botActions.changeIntent(String(newIntent));
        response.json({
          status: 'complete'
        })
      })
  }


  /**
   * Route to handle bot status message
   */
  createResetSensorRoute() {
    this._webApp.route('/resetSensors')
      .post((request, response) => {
        this._botActions.resetSensors()
        response.json({
          status: 'complete'
        })
      })
  }

  /**
   * route to handle main page user sees in browser
   */
  createHomeRoute() {
    this._webApp.get('/', (request, response) => {
      const sensorData = this._sensors.getSensorDataSet();
      const botStatus = this._botActions.getBotStatus();
      const sensorKeys = this._sensors.getSensorKeys();

      response.render('home', {
        data: sensorData,
        status: botStatus,
        sensors: this._sensors.getSensorDataSet(),
        intents: BotIntents
      })
    })
  }

  /**
   * route to handle dashboard page user sees in browser
   */
  createDashRoute() {
    this._webApp.get('/dash', (request, response) => {
      const sensorData = this._sensors.getSensorDataSet();
      const botStatus = this._botActions.getBotStatus();
      const sensorKeys = this._sensors.getSensorKeys();

      response.render('dash', {
        data: sensorData,
        status: botStatus,
        sensors: this._sensors.getSensorDataSet(),
        intents: BotIntents
      })
    })
  }

  /**
   * route to handle phone page user sees in browser
   */
  createPhoneRoute() {
    this._webApp.get('/phone', (request, response) => {
      const sensorData = this._sensors.getSensorDataSet();
      const botStatus = this._botActions.getBotStatus();
      const sensorKeys = this._sensors.getSensorKeys();

      response.render('phone', {
        data: sensorData,
        status: botStatus,
        sensors: this._sensors.getSensorDataSet(),
        intents: BotIntents
      })
    })
    this._webApp.route('/phone/:channel-:newValueX-:newValueY-:newValueZ')
      .post((request, response) => {
        const phoneSensorChannel = request.params.channel;
        const sensorValueX = request.params.newValueX;
        const sensorValueY = request.params.newValueY;
        const sensorValueZ = request.params.newValueZ;
        this._sensors.setDataValue(`phone${phoneSensorChannel}X`, sensorValueX);
        this._sensors.setDataValue(`phone${phoneSensorChannel}Y`, sensorValueY);
        this._sensors.setDataValue(`phone${phoneSensorChannel}Z`, sensorValueZ);
        const sensorData = this._sensors.getSensorDataSet();
        const botStatus = this._botActions.getBotStatus();
        response.json({
          data: sensorData,
          status: botStatus,
        })
      })
  }


  /**
   * server error handler
   * @param  {[Object]} err [message object]
   */
  onServerStarted(err) {
    if (err) {
      console.error('http server error', err);
    }
    console.log(`express server listening on ${this._port}`);
  }

  startHttpServer() {
    this.setUpEngine();
    this.createHomeRoute();
    this.createStatusRoute();
    this.createSensorsRoute();
    this.createIntentRoute();
    this.createResetSensorRoute();
    this.createPhoneRoute();
    this.createDashRoute();

    this._server.listen(this._port, this.onServerStarted.bind(this));

  }


}

module.exports = HttpServer;