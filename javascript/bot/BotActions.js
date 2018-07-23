const BotIntents = require('./BotIntents');
const swim = require('swim-client-js');

/**
 * [_movementStatus description]
 * @type {[type]}
 */
class BotActions {
    constructor(sensors, botState, servoController, arduinoController) {
        this._sensors = sensors;
        this._botState = botState;
        this._servoController = servoController;
        this._arduinoController = arduinoController;
        this._currentIntent = null;
        this._currTiltValue = 90;
        this._currPanValue = 90;
        this._tickCount = 0;
        this._swimClient = new swim.Client();
        const intentValueLane = this._swimClient.downlinkValue()
            .host(`ws://127.0.0.1:5620`)
            .node('/botState')
            .lane('currentIntent')
            .didSet((newValue) => {
                if(!this._currentIntent || this._currentIntent.name !== newValue) {
                    this.changeIntent(newValue);
                }
                
            });    
        
        intentValueLane.open();
    }

    map(x, in_min, in_max, out_min, out_max) {
        return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }

    resetSensors() {
        this._sensors.resetSensorValues();
    }

    setCanDrive(direction = 'forward', isActive = false) {
        // this._botState.setStateValue('movement', (direction == 'forward') ? 'canDriveForward' : 'canDriveBackward', isActive);
        this._botState.setStateValue('setCanDriveForward', this._currentIntent.name);
    }

    setIsDriving(isDriving = false) {
        // this._botState.setStateValue('movement', 'isDriving', isDriving);
        // this._botState.setStateValue('setCurrentIntent', this._currentIntent.name);
    }

    changeIntent(newIntent) {

        // make sure there is a proper intent passed
        if (typeof newIntent === 'string') {
            newIntent = BotIntents[newIntent];
            if (!newIntent || !newIntent.name) {
                console.log(`new intent not found ${newIntent}`);
                return false;
            }
        }

        

        // make sure its not already active
        if (this._currentIntent && newIntent && newIntent.name === this._currentIntent.name) {
            console.log(`intent already active`)
            return false;
        }

        // end the active intent
        if (this._currentIntent && this._currentIntent.rules && this._currentIntent.rules.end) {
            this._currentIntent.rules.end(this._sensors, this);
            this._currentIntent = null;
        }

        if(newIntent) {
            // set the new intent value
            this._currentIntent = newIntent;
            console.log(`Change intent: ${this._currentIntent.name}`)
            this._botState.setStateValue('setCurrentIntent', this._currentIntent.name);
        }

        // start the new intent
        if (this._currentIntent && this._currentIntent.rules && this._currentIntent.rules.start) {
            this._currentIntent.rules.start(this._sensors, this);
        }
    }

    handleStartUp() {
        // this._startupTime = new Date();
        // this._botState.saveDataSetToDB();
        // this._botState.setStateValue('main', 'startupTime', this._startupTime);
        this._servoController.restartScriptAtSubroutine(1);

        return true;
    }

    handleTick(sensors, loopInterval) {
        // update current active intent
        this._tickCount++
        if (this._tickCount % 10 === 0) {
            // this._botState.setStateValue('setCurrentIntent', this._currentIntent.name);
        }
        if (this._tickCount > (30000/loopInterval)) {
            // sensors.refreshSystemInfo()
            if(this._currentIntent === BotIntents.idle) {
                this._servoController.restartScriptAtSubroutine(2);
            }
            this._tickCount = 0;
        }
        if (this._currentIntent && this._currentIntent.rules && this._currentIntent.rules.update) {
            this._currentIntent.rules.update(this._sensors, this);
        }
    }

    handlePingSensors() {
        // const minSensorDist = 2000;
        const sensorData = this._sensors.getSensorDataSet();
        // const currState = this._botState.getFullState()
        // const canDriveForward = this._sensors.centerDistance.current > this._sensors.centerDistance.threshold
        // const canDriveBackward = this._sensors.rearDistance.current > this._sensors.rearDistance.threshold
        // console.info('forward', parseInt(sensorData.centerDistance.current), parseInt(sensorData.centerDistance.threshold))
        if(sensorData.centerDistance && sensorData.centerDistance.current && sensorData.centerDistance.threshold) {
            this._botState.setStateValue('setCanDriveForward', parseInt(sensorData.centerDistance.current) > parseInt(sensorData.centerDistance.threshold));
        }
        if(sensorData.rearDistance && sensorData.rearDistance.current && sensorData.rearDistance.threshold) {
            this._botState.setStateValue('setCanDriveBackward', parseInt(sensorData.rearDistance.current) > parseInt(sensorData.rearDistance.threshold));
        }

    }

    handleGoIdle() {
        this._botState.setStateValue('setCanDriveForward', false);
        this._botState.setStateValue('setCanDriveBackward', false);
        this._servoController.reset();
        this.setIsDriving(false);

    }

    handleHeadsUpMovement() {
        const sensorData = this._sensors.getSensorDataSet();
        this._servoController.setTarget(0, parseInt(sensorData.phoneMagX.current).map(0, 180, 640, 2304));
        this._servoController.setTarget(1, parseInt(sensorData.phoneMagY.current).map(0, 360, 640, 2304));
        // const tiltValue = sensorData.phoneMagX.current - 25;
        // if (tiltValue > 14 && tiltValue < 175) {
        //     sensors.setDataValue('tiltRadio', tiltValue);
        // }
        // if (sensorData.phoneMagY.current >= 90 && sensorData.phoneMagY.current <= 270) {
        //     let panValue = this.map(sensorData.phoneMagY.current, 90, 270, 0, 180);
        //     sensors.setDataValue('panRadio', panValue);
        // }
    }

    handleRcInput() {
        const sensorData = this._sensors.getSensorDataSet();
        this._servoController.setTarget(2, parseInt(sensorData.steeringRadio.current).map(0, 180, 640, 2304));
        this._servoController.setTarget(3, parseInt(sensorData.throttleRadio.current).map(0, 180, 640, 2304));

        // const currState = this._botState.getFullState();
        // if (!currState.movement.canDriveForward && !currState.obstacles.center) {
        //     // this._botState.setStateValue('movement', 'canDriveForward', true);
        // }
        // if (currState.movement.canDriveForward && currState.obstacles.center) {
        //     // this._botState.setStateValue('movement', 'canDriveForward', false);

        // }
        // if (!currState.movement.canDriveBackward) {
        //     // this._botState.setStateValue('movement', 'canDriveBackward', true);
        // }

        // if (!currState.movement.canDriveForward && sensorData.throttleRadio.current < 90) {
        //     sensors.setDataValue('throttleRadio', 90);
        // } else {
        //     if (this._botState.getStateValue('obstacles', 'left')) {
        //         if (sensors.getSensorDataValue('steeringRadio') !== 180) {
        //             sensors.setDataValue('steeringRadio', 180);
        //         }
        //     } else if (this._botState.getStateValue('obstacles', 'right')) {
        //         if (sensors.getSensorDataValue('steeringRadio') !== 0) {
        //             sensors.setDataValue('steeringRadio', 0);
        //         }
        //     } else {
        //         if (sensors.getSensorDataValue('steeringRadio') !== 90) {
        //             sensors.setDataValue('steeringRadio', 90);
        //         }
        //     }
        // }
    }

}

module.exports = BotActions;