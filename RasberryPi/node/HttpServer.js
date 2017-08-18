const http = require('http');
const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
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
  }

  setUpEngine() {
    this._webApp = express();
    this._webApp.engine('.hbs', exphbs({
      defaultLayout: 'main',
      extname: '.hbs',
      layoutsDir: path.join(__dirname, 'views/layouts')
    }));
    this._webApp.set('view engine', '.hbs');
    this._webApp.set('views', path.join(__dirname, 'views'));
  }

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

  createHomeRoute() {
    this._webApp.get('/', (request, response) => {
      const sensorData = this._sensors.getSensorDataSet();
      const botStatus = this._botActions.getBotStatus();
      response.render('home', {
        data: sensorData,
        status: botStatus,
      })
    })
  }

  onServerStarted(err) {
    if(err) {
      return console.error('http server error', err);
    }
    console.log(`express server listening on ${this._port}`);
  }

  startHttpServer() {
    this.setUpEngine();
    this.createHomeRoute();
    this.createStatusRoute();
    this.createSensorsRoute();

    this._webApp.listen(this._port, this.onServerStarted.bind(this));

  }


}

module.exports = HttpServer;
