const moment = require('moment');
const BotIntents = require('./BotIntents');

/**
 * [_movementStatus description]
 * @type {[type]}
 */
class BotActions {
  constructor(sensors) {
    this._movementStatus = null;
    this._steeringStatus = null;
    this._sensors = sensors;
    this._startupTime = null;
    this._currentIntent = null;
    this._currTiltValue = 90;
    this._currPanValue = 90;
  }

  wakeUp() {
    this._startupTime = new moment();
    this.changeIntent(BotIntents.idle);
  }

  allStop() {
    //this._servos.sendThrottleMsg('stop');
    this._movementStatus = 'stop';
    //this._servos.sendSteeringMsg('center');
    this._steeringStatus = 'center';
  }

  resetSensors() {
    this._sensors.resetSensorValues();
  }

  getBotStatus() {
    return {
      uptime: moment(this._startupTime).fromNow(true),
      movement: this._movementStatus,
      steering: this._steeringStatus,
      currentIntent: this._currentIntent && this._currentIntent.name || 'none'
    }
  }

    changeIntent(newIntent) {

        if(typeof newIntent === 'string') {
          newIntent = BotIntents[newIntent];
          if(!newIntent && !newIntent.name) {
            console.log(`new intent not found ${newIntent}`);
            return false;
          }
        }
        if(this._currentIntent && newIntent.name === this._currentIntent.name) {
          console.log(`intent already active`)
          return false;
        }
        if(this._currentIntent && this._currentIntent.rules && this._currentIntent.rules.end) {
          this._currentIntent.rules.end(this._sensors, newIntent);
          this._currentIntent = null;
        }
        this._currentIntent = newIntent;
        console.log(`Change intent: ${this._currentIntent.name}`)
        if(this._currentIntent && this._currentIntent.rules && this._currentIntent.rules.start) {
          this._currentIntent.rules.start(this._sensors, this);
        }
    }

    handleTick() {
        if(this._currentIntent && this._currentIntent.rules && this._currentIntent.rules.update) {
            this._currentIntent.rules.update(this._sensors.getSensorDataSet(), this);
        }
    }

    handleTiltPan(sensorData) {
        //console.error(this._servos);
        if (sensorData.tiltRadio.current !== this._currTiltValue) {
          this._currTiltValue = sensorData.tiltRadio.current;
          //this._servos.sendSteeringMsg(`pos:1:${this._currTiltValue}`);
        }
        if (sensorData.panRadio.current !== this._currPanValue) {
          this._currPanValue = sensorData.panRadio.current;
          //this._servos.sendSteeringMsg(`pos:0:${this._currPanValue}`);
        }
    }

    handleDriveForard() {
    }

}

module.exports = BotActions;
