/**
 * [_sensorData description]
 * @type {Object}
 */
class Sensors {
  constructor() {
    this._sensorData = {
      dist1: 0,
      dist2: 0,
      rc1: 0,
      rc2: 0,
      compass:0
    }

  }

  setDataValue(key, value) {
    if(this._sensorData.hasOwnProperty(key)) {
      this._sensorData[key] = value;
    } else {
      console.log(`Sensors error: can't set ${key} to ${value}`);
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
        	this.setDataValue[cmdArr[0]] = cmdArr[1];
        }
      }
    }
  }

  getSensorDataValue(sensorKey) {
    return (this._sensorData.hasOwnProperty(sensorKey)) ? this._sensorData[sensorKey] : 0;
  }

  getSensorDataSet() {
    return this._sensorData;
  }
}

module.exports = Sensors;
