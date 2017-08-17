/**
 * [_movementStatus description]
 * @type {[type]}
 */
class BotActions {
  constructor(servos, sensors) {
    this._movementStatus = null;
    this._steeringStatus = null;
    this._servos = servos;
    this._sensors = sensors;

  }

  wakeUp() {
    this._servos.sendThrottleMsg('stop');
    this._movementStatus = 'stop';
    this._servos.sendSteeringMsg('center');
    this._steeringStatus = 'center';
  }

  handleRawData() {
    const sensorData = this._sensors.getSensorDataSet();
    if(sensorData.rc1 <= -100) {
      if(this._movementStatus != 'forward') {
        this._servos.sendThrottleMsg('forward');
        this._movementStatus = 'forward';
      }
    } else if(sensorData.rc1 >= 100) {
      if(this._movementStatus != 'reverse') {
        this._servos.sendThrottleMsg('reverse');
        this._movementStatus = 'reverse';
      }
    } else {
      if(this._movementStatus != 'stop') {
        this._servos.sendThrottleMsg('stop');
        this._movementStatus = 'stop';
      }
    }

    if(sensorData.rc2 <= -100) {
      if(this._steeringStatus != 'left') {
        this._servos.sendSteeringMsg('left');
        this._steeringStatus = 'left';
      }
    } else if(sensorData.rc2 >= 100) {
      if(this._steeringStatus != 'right') {
        this._servos.sendSteeringMsg('right');
        this._steeringStatus = 'right';
      }
    } else {
      if(this._steeringStatus != 'center') {
        this._servos.sendSteeringMsg('center');
        this._steeringStatus = 'center';
      }
    }
  }

}

module.exports = BotActions;
