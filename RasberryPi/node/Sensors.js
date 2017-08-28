/**
 * [_sensorData description]
 * @type {Object}
 */
class Sensors {
  constructor(db) {
    this._sensorData = {
      leftDistance: {
        min: 0,
        max: 10000,
        default: 0,
        current: 0
      },
      rightDistance: {
        min: 0,
        max: 10000,
        default: 0,
        current: 0
      },
      centerDistance: {
        min: 0,
        max: 10000,
        default: 0,
        current: 0
      },
      groundDistance: {
        min: 0,
        max: 10000,
        default: 0,
        current: 0
      },

      throttleRadio: {
        min: -100,
        max: 100,
        default: 0,
        current: 0
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
        min: -180,
        max: 180,
        default: 0,
        current: 0
      },

      compass2: {
        min: -180,
        max: 180,
        default: 0,
        current: 0
      },

      gyroX: {
        min: -180,
        max: 180,
        default: 0,
        current: 0
      },

      gyroY: {
        min: -180,
        max: 180,
        default: 0,
        current: 0
      },

      gyroZ: {
        min: -180,
        max: 180,
        default: 0,
        current: 0
      },

      tempurature: {
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
        max: 10000,
        default: 0,
        current: 0
      }

    }
    this._db = db;
  }

  getSensorKeys() {
    return Object.keys(this._sensorData)
  }

  setDataValue(key, value) {
    if(this._sensorData.hasOwnProperty(key)) {
      if(key.indexOf('compass') >= 0 && value !== 0) {
        //value = (value < 0) ? (Number(value) + 360) : value;
      }
      const sensor = this._sensorData[key];
      if(value > sensor.max) value = sensor.max;
      if(value < sensor.min) value = sensor.min;
      sensor.current = value;
      let findObj = {
		  name: key
	  }
      this._db.botData.findAndModify({
			query: { name: key },
			update: { $set: { value: value } },
			new: true,
			upsert: true
		}, (err, doc, lastErrorObject) => {
		})
      //console.log(`Sensors: set ${key} to ${value}`);
    } else {
      //console.log(`Sensors error: can't set ${key} to ${value}`);
    }
  }

  setSensorDataSet(sensorData) {
    var dataArray = sensorData.split(',');
    if(dataArray) {
      for(var i = 0; i < dataArray.length; i++) {
        var dataCommand = dataArray[i];
        //console.log(dataCommand);
        var cmdArr = dataCommand.split(':');
        if(cmdArr && cmdArr.length == 2) {
			this.setDataValue(cmdArr[0], cmdArr[1]);
			
        }
      }
    }
  }

  getSensorDataValue(sensorKey) {
    return (this._sensorData.hasOwnProperty(sensorKey)) ? this._sensorData[sensorKey].current : 0;
  }

  getSensorDataSet() {
    return this._sensorData;
  }

  resetSensorValues() {
    for(const sensor in this._sensorData) {
      this._sensorData[sensor].current = this._sensorData[sensor].default;
    }
  }
}

module.exports = Sensors;
