const Log = require('../utils/Log');
const sysInfo = require('systeminformation');
const client = require('swim-client-js');
const swim = new client.Client({
  sendBufferSize: 1024 * 1024
});

Number.prototype.map = function (in_min, in_max, out_min, out_max) {
  return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

/**
 * [_sensorData description]
 * @type {Object}
 */
class Sensors {
  constructor(swimUrl) {
    this.fullSwimUrl = swimUrl;
    this.swimClient = swim;
    this.minDistanceValue = 2000;
    this.obstDistValue = 3500;
    this.maxDistanceValue = 12000;

    // define all sensor channels that will be tracked
    // along with their min/max, default, and threshold values
    this._sensorData = {
      leftDistance: {
        min: 0,
        max: this.maxDistanceValue,
        default: 0,
        current: 0,
        threshold: this.obstDistValue
      },
      rightDistance: {
        min: 0,
        max: this.maxDistanceValue,
        default: 0,
        current: 0,
        threshold: this.obstDistValue
      },
      centerDistance: {
        min: 0,
        max: this.maxDistanceValue,
        default: 0,
        current: 0,
        threshold: this.minDistanceValue
      },
      headDistance: {
        min: 0,
        max: this.maxDistanceValue,
        default: 0,
        current: 0,
        threshold: this.minDistanceValue
      },
      rearDistance: {
        min: 0,
        max: this.maxDistanceValue,
        default: 0,
        current: 0,
        threshold: this.minDistanceValue
      },

      throttleRadio: {
        min: 0,
        max: 180,
        default: 90,
        current: 90
      },
      
      steeringRadio: {
        min: 0,
        max: 180,
        default: 90,
        current: 90
      },
      tiltRadio: {
        min: 0,
        max: 180,
        default: 90,
        current: 90
      },
      panRadio: {
        min: 0,
        max: 180,
        default: 90,
        current: 90
      },

      compass1: {
        min: 0,
        max: 360,
        default: 0,
        current: 0
      },

      gyroX: {
        min: -200,
        max: 200,
        default: 0,
        current: 0
      },

      gyroY: {
        min: -200,
        max: 200,
        default: 0,
        current: 0
      },

      gyroZ: {
        min: -200,
        max: 200,
        default: 0,
        current: 0
      },

      accelX: {
        min: -3000,
        max: 3000,
        default: 0,
        current: 0
      },

      accelY: {
        min: -3000,
        max: 3000,
        default: 0,
        current: 0
      },

      accelZ: {
        min: -3000,
        max: 3000,
        default: 0,
        current: 0
      },

      magX: {
        min: -500,
        max: 500,
        default: 0,
        current: 0
      },

      magY: {
        min: -500,
        max: 500,
        default: 0,
        current: 0
      },

      magZ: {
        min: -500,
        max: 500,
        default: 0,
        current: 0
      },

      temperature: {
        min: 0,
        max: 135,
        default: 0,
        current: 0
      },

      temperature2: {
        min: 0,
        max: 135,
        default: 0,
        current: 0
      },

      pressure: {
        min: 300,
        max: 1100,
        default: 300,
        current: 300
      },

      altitude: {
        min: 0,
        max: 15000,
        default: 0,
        current: 0
      },

      phoneMagX: {
        min: 0,
        max: 180,
        default: 90,
        current: 0
      },

      phoneMagY: {
        min: 0,
        max: 360,
        default: 90,
        current: 0
      },

      phoneMagZ: {
        min: -90,
        max: 90,
        default: 0,
        current: 0
      },

      cpuTemp: {
        min: 0,
        max: 200,
        default: 0,
        current: 0
      },

      memoryUsage: {
        min: 0,
        max: 773050368,
        default: 0,
        current: 0
      },

      sysAvgLoad: {
        min: 0,
        max: 100,
        default: 0,
        current: 0
      },

      sysCurrLoad: {
        min: 0,
        max: 100,
        default: 0,
        current: 0
      },

      timestamp: {
        min: 0,
        max: 9999999999,
        default: 0,
        current: 0
      }

    }
  }

  /**
   * Sensors handler startup
   */
  start() {

    // create value lanes for sensors which dont live onboard the rover like RC and phone
    this.swimClient.downlinkValue()
      .host(`ws://127.0.0.1:5620`)
      .node('/sensor/phoneMagX')
      .lane('latest')
      .didSet((newValue) => {
        this._sensorData.phoneMagX.current = newValue;
      })
      .open();

    this.swimClient.downlinkValue()
      .host(`ws://127.0.0.1:5620`)
      .node('/sensor/phoneMagY')
      .lane('latest')
      .didSet((newValue) => {
        this._sensorData.phoneMagY.current = newValue;
      })
      .open();

    this.swimClient.downlinkValue()
      .host(`ws://127.0.0.1:5620`)
      .node('/sensor/steeringRadio')
      .lane('latest')
      .didSet((newValue) => {
        this._sensorData.steeringRadio.current = newValue;
      })
      .open();

    this.swimClient.downlinkValue()
      .host(`ws://127.0.0.1:5620`)
      .node('/sensor/throttleRadio')
      .lane('latest')
      .didSet((newValue) => {
        this._sensorData.throttleRadio.current = newValue;
      })
      .open();

    this.swimClient.downlinkValue()
      .host(`ws://127.0.0.1:5620`)
      .node('/sensor/tiltRadio')
      .lane('latest')
      .didSet((newValue) => {
        this._sensorData.tiltRadio.current = newValue;
      })
      .open();

    this.swimClient.downlinkValue()
      .host(`ws://127.0.0.1:5620`)
      .node('/sensor/panRadio')
      .lane('latest')
      .didSet((newValue) => {
        this._sensorData.panRadio.current = newValue;
      })
      .open();

    // prepopulate the swim sensor service with all the sensor values
    // we will be keeping track of along with their default threshold values
    for (const sensor of this.getSensorKeys()) {
      const currSensorData = this._sensorData[sensor];
      if (currSensorData) {
        this.sendSensorDataCommand(sensor, currSensorData.default);
        if (currSensorData.threshold) {
          swim.command(this.fullSwimUrl, `/sensor/${sensor}`, `setThreshold`, currSensorData.threshold);
        }
      }
    }
  }

  getSensorKeys() {
    return Object.keys(this._sensorData)
  }

  /**
   * this posts key value pair to a specified sensor lane as a command to swim 
   */
  sendSensorDataCommand(messageKey, messageData) {
    swim.command(this.fullSwimUrl, `/sensor/${messageKey}`, `addLatest`, messageData);
  }

  /**
   * Handle updating a specific sensor value in memory and in swim service
   * 
   * @param {string} key - the name of the sensor being updated
   * @param {*} value - the value of the sensor being update
   */
  setDataValue(key, value) {
    if (this._sensorData.hasOwnProperty(key)) {
      value = parseInt(value);
      if (key.indexOf('compass1') >= 0 && value !== 0) {
        value = (value < 0) ? (Number(value) + 360) : value;
      }
      const sensor = this._sensorData[key];
      if (value > sensor.max) value = sensor.max;
      if (value < sensor.min) value = sensor.min;

      if(key.indexOf("Dist") >= 0 && value == 0) {
        value = sensor.current;
      }
      sensor.current = value;

      // if(value < 0) {
      //   value = value * -1;
      // }

      // this.sendSensorDataCommand(key, Math.round(sensor.current));
      this.sendSensorDataCommand(key, sensor.current);

      // Log.info(`Sensors: set ${key} to ${sensor.current}`);
    } else {
      Log.error(`Sensors error: can't set ${key} to ${value}`);
    }
  }

  setSensorDataSet(sensorData) {
    // Log.info(sensorData);
    try {
      var dataCommand = sensorData.toString();
      if (dataCommand && dataCommand.length > 0 && dataCommand.indexOf(':') >= 0) {
        // Log.info(dataCommand);
        var cmdArr = dataCommand.split(':');
        if (cmdArr && cmdArr.length == 2) {
          this.setDataValue(cmdArr[0], cmdArr[1]);
        }
      }
    } catch (err) {
      Log.error(err)
      // console.info(sensorData);
    }
  }

  refreshSystemInfo() {
    sysInfo.cpuTemperature((data) => {
      this.setDataValue('cpuTemp', data.main);
    })
    sysInfo.mem((data) => {
      this.setDataValue('memoryUsage', data.free);
    })
    sysInfo.currentLoad((data) => {
      this.setDataValue('sysAvgLoad', data.avgload);
      this.setDataValue('sysCurrLoad', data.currentload);
    })
  }

  getSensorDataValue(sensorKey) {
    return (this._sensorData.hasOwnProperty(sensorKey)) ? this._sensorData[sensorKey].current : 0;
  }

  getSensorDataSet() {
    return this._sensorData;
  }

  resetSensorValues() {
    for (const sensor in this._sensorData) {
      this._sensorData[sensor].current = this._sensorData[sensor].default;
    }
  }
}

module.exports = Sensors;