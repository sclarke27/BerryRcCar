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

  createGetRoutes() {
    this._webApp.get('/', (request, response) => {
      const sensorData = this._sensors.getSensorDataSet();
      response.render('home', {
        testData: 'derp',
        data: sensorData
      })
    })
  }

  createPostRoutes() {

  }

  onServerStarted(err) {
    if(err) {
      return console.error('http server error', err);
    }
    console.log(`express server listening on ${this._port}`);
  }

  startHttpServer() {
    this.setUpEngine();
    this.createGetRoutes();
    this.createPostRoutes();

    this._webApp.listen(this._port, this.onServerStarted.bind(this));

  }


}

module.exports = HttpServer;
