const moment = require('moment');
const BotIntents = require('./BotIntents');

/**
 * [_movementStatus description]
 * @type {[type]}
 */
class BotActions {
    constructor(sensors, botState) {
        this._sensors = sensors;
        this._botState = botState;
        this._currentIntent = null;
        this._currTiltValue = 90;
        this._currPanValue = 90;
    }
	
	map(x, in_min, in_max, out_min, out_max) {
		return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
	}

    resetSensors() {
        this._sensors.resetSensorValues();
    }

    getBotStatus() {
        return this._botState.getFullState();
    }

    setCanDrive(direction = 'forward', isActive = false) {
        this._botState.setStateValue('movement', (direction == 'forward') ? 'canDriveForward' : 'canDriveBackward', isActive);
    }

    setIsDriving(isDriving = false) {
        this._botState.setStateValue('movement', 'isDriving', isDriving);
    }

    changeIntent(newIntent) {

		// make sure there is a proper intent passed
        if(typeof newIntent === 'string') {
          newIntent = BotIntents[newIntent];
          if(!newIntent && !newIntent.name) {
            console.log(`new intent not found ${newIntent}`);
            return false;
          }
        }
		
		// make sure its not already active
        if(this._currentIntent && newIntent.name === this._currentIntent.name) {
          console.log(`intent already active`)
          return false;
        }
		
		// end the active intent
        if(this._currentIntent && this._currentIntent.rules && this._currentIntent.rules.end) {
          this._currentIntent.rules.end(this._sensors, this);
          this._currentIntent = null;
        }

		// set the new intent value
        this._currentIntent = newIntent;
        console.log(`Change intent: ${this._currentIntent.name}`)
        this._botState.setStateValue('main', 'currentIntent', this._currentIntent.name);

		// start the new intent
        if(this._currentIntent && this._currentIntent.rules && this._currentIntent.rules.start) {
          this._currentIntent.rules.start(this._sensors, this);
        }
    }

    handleStartUp() {
        this._startupTime = new Date();
        this._botState.saveDataSetToDB();
        this._botState.setStateValue('main', 'startupTime', this._startupTime);
        this.changeIntent(BotIntents.idle);
    }

    handleTick() {
		// update current active intent
        if(this._currentIntent && this._currentIntent.rules && this._currentIntent.rules.update) {
            this._currentIntent.rules.update(this._sensors, this);
        }
    }

    handlePingSensors(sensors) {
        const minSensorDist = 2000;
		const sensorData = sensors.getSensorDataSet();
        const currState = this._botState.getFullState()
        if (sensorData.leftDistance.current < minSensorDist && !currState.obsticles.left) {
            this._botState.setStateValue('obsticles', 'left', true);
        }
        if (sensorData.leftDistance.current > minSensorDist && currState.obsticles.left) {
            this._botState.setStateValue('obsticles', 'left', false);
        }
        if (sensorData.centerDistance.current < minSensorDist && !currState.obsticles.center) {
            this._botState.setStateValue('obsticles', 'center', true);
        }
        if (sensorData.centerDistance.current > minSensorDist && currState.obsticles.center) {
            this._botState.setStateValue('obsticles', 'center', false);
        }
        if (sensorData.rightDistance.current < minSensorDist && !currState.obsticles.right) {
            this._botState.setStateValue('obsticles', 'right', true);
        }
        if (sensorData.rightDistance.current > minSensorDist && currState.obsticles.right) {
            this._botState.setStateValue('obsticles', 'right', false);
        }
    }

    handleGoIdle() {
        this._botState.setStateValue('movement', 'canDriveForward', false);
        this._botState.setStateValue('movement', 'canDriveBackward', false);
        this.setIsDriving(false);

    }
	
	handleHeadsUpMovement(sensors, botActions) {
		const sensorData = sensors.getSensorDataSet();
		const tiltValue = sensorData.phoneMagX.current - 25;
		if(tiltValue > 14 && tiltValue < 175) {
			sensors.setDataValue('tiltRadio', tiltValue);
		}
		if(sensorData.phoneMagY.current >= 90 && sensorData.phoneMagY.current <= 270) {
			let panValue = this.map(sensorData.phoneMagY.current, 90, 270, 0, 180);
			sensors.setDataValue('panRadio', panValue);
		}
	}

    handleDriveForard(sensors, botActions) {
		const sensorData = sensors.getSensorDataSet();
        const currState = this._botState.getFullState();
        if(!currState.movement.canDriveForward && !currState.obsticles.center) {
            this._botState.setStateValue('movement', 'canDriveForward', true);
        }
        if(currState.movement.canDriveForward && currState.obsticles.center) {
            this._botState.setStateValue('movement', 'canDriveForward', false);
			
        }
        if(!currState.movement.canDriveBackward) {
            this._botState.setStateValue('movement', 'canDriveBackward', true);
        }

		if(!currState.movement.canDriveForward && sensorData.throttleRadio.current < 90) {
			sensors.setDataValue('throttleRadio', 90);
		} else {
			if(this._botState.getStateValue('obsticles', 'left')) {
				if(sensors.getSensorDataValue('steeringRadio') !== 180) {
					sensors.setDataValue('steeringRadio', 180);
				}
			} else if(this._botState.getStateValue('obsticles', 'right')) {
				if(sensors.getSensorDataValue('steeringRadio') !== 0) {
					sensors.setDataValue('steeringRadio', 0);
				}
			} else {
				if(sensors.getSensorDataValue('steeringRadio') !== 90) {
					sensors.setDataValue('steeringRadio', 90);
				}
			}
		}
    }

}

module.exports = BotActions;
