const BotIntents = require('./BotIntents');
const swim = require('swim-client-js');
const Log = require('../utils/Log');

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
        this._throttle = {
            maxFoward: 80,
            allStop: 90,
            maxReverse: 104,
            current : 90
        }
        this._steering = {
            maxLeft: 0,
            center: 90,
            maxRight: 180,
            current: 90
        }
        this._headScan = {
            minAngle: 0,
            maxAngle: 360,
            currentAngle: 90,
            scanValues: {},
            panClockwise: true
        }
        this._servos = {
             
        }
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
                Log.info(`new intent not found`);
                return false;
            }
        }

        // set the new intent value
        if(newIntent) {
            // make sure its not already active
            if (this._currentIntent && newIntent.name === this._currentIntent.name) {
                Log.info(`intent already active`)
                return false;
            }

            // end the active intent
            if (this._currentIntent && this._currentIntent.rules && this._currentIntent.rules.end) {
                this._currentIntent.rules.end(this._sensors, this);
                this._currentIntent = null;
            }

            this._currentIntent = newIntent;
            Log.info(`Change intent: ${this._currentIntent.name}`)
            this._botState.setStateValue('setCurrentIntent', this._currentIntent.name);

            // start the new intent
            if (this._currentIntent && this._currentIntent.rules && this._currentIntent.rules.start) {
                this._currentIntent.rules.start(this._sensors, this);
            }

        }

    }

    handleStartUp() {
        // this._startupTime = new Date();
        // this._botState.saveDataSetToDB();
        // this._botState.setStateValue('main', 'startupTime', this._startupTime);
        this.resetAllToDefaultState();
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

            // idle animation
            
            // if(this._currentIntent === BotIntents.idle) {
            //     this._servoController.restartScriptAtSubroutine(2);
            // }

            // this._tickCount = 0;
        }
        if (this._currentIntent && this._currentIntent.rules && this._currentIntent.rules.update) {
            this._currentIntent.rules.update(this._sensors, this);
        }
    }

    handlePingSensors() {
        const minSensorDist = 2000;
        const sensorData = this._sensors.getSensorDataSet();
        const currState = this._botState.getFullState()

        if(sensorData.centerDistance && sensorData.centerDistance.current && sensorData.centerDistance.threshold) {
            const centerCheck = parseInt(sensorData.centerDistance.current) > parseInt(sensorData.centerDistance.threshold)
            if(currState.canDriveForward !== centerCheck) {
                this._botState.setStateValue('setCanDriveForward', centerCheck);
            }
        }

        if(sensorData.rearDistance && sensorData.rearDistance.current && sensorData.rearDistance.threshold) {
            const rearCheck = parseInt(sensorData.rearDistance.current) > parseInt(sensorData.rearDistance.threshold);
            if(currState.canDriveBackward != rearCheck) {
                this._botState.setStateValue('setCanDriveBackward', rearCheck);
            }
        }

    }

    resetAllToDefaultState() {
        this._botState.setStateValue('setCanDriveForward', false);
        this._botState.setStateValue('setCanDriveBackward', false);
        this._sensors.setDataValue('tiltRadio', 65);
        this._sensors.setDataValue('panRadio', 180);
        this._servoController.reset();
        this.setIsDriving(false);
    }

    handleGoIdle() {
        this.resetAllToDefaultState();
    }

    handleManualHeadMovement() {
        const sensorData = this._sensors.getSensorDataSet();
        this._servoController.setTarget(0, parseInt(sensorData.tiltRadio.current).map(0, 180, 640, 2304));
        this._servoController.setTarget(1, parseInt(sensorData.panRadio.current).map(0, 360, 640, 2304));
    }

    handleHeadsUpMovement() {
        const sensorData = this._sensors.getSensorDataSet();
        // this._servoController.setTarget(0, parseInt(sensorData.phoneMagX.current).map(0, 180, 640, 2304));
        // this._servoController.setTarget(1, parseInt(sensorData.phoneMagY.current).map(0, 360, 640, 2304));
        const tiltValue = sensorData.phoneMagX.current - 25;
        if (tiltValue > 14 && tiltValue < 175) {
            this._sensors.setDataValue('tiltRadio', tiltValue);
        }
        if (sensorData.phoneMagY.current >= 90 && sensorData.phoneMagY.current <= 270) {
            let panValue = this.map(sensorData.phoneMagY.current, 90, 270, 0, 180);
            this._sensors.setDataValue('panRadio', panValue);
        }

        this._servoController.setTarget(0, parseInt(sensorData.tiltRadio.current).map(0, 180, 640, 2304));
        this._servoController.setTarget(1, parseInt(sensorData.panRadio.current).map(0, 360, 640, 2304));

    }

    handleAutoDrive() {
        const sensorData = this._sensors.getSensorDataSet();
        const currState = this._botState.getFullState();
        let newSpeed = this._throttle.allStop;// - (Math.round(this._throttle.maxFoward * centerAvg));
        let newSteering = this._steering.center;

        // Log.info('autodrive update tick:' +  this._tickCount);

        if(currState.canDriveForward) {
            
            // if(this._throttle.current !== newSpeed) {
            //     this._throttle.current = newSpeed;
            //     Log.info(`new forward speed ${this._throttle.current}`);
            //     throttleChanged = true;
            // }

            if(sensorData.centerDistance.current > sensorData.centerDistance.threshold) {
                if(sensorData.centerDistance.current > 7000) {
                    newSpeed = 84;
                } else if(sensorData.centerDistance.current <= 7000 && sensorData.centerDistance.current > sensorData.centerDistance.threshold) {
                    newSpeed = 82;
                }
            } else {
                newSpeed = this._throttle.allStop;
            }

            if(sensorData.leftDistance.current < sensorData.leftDistance.threshold && sensorData.rightDistance.current > sensorData.rightDistance.threshold) {
                newSteering = this._steering.maxRight;
            }

            if(sensorData.leftDistance.current > sensorData.leftDistance.threshold && sensorData.rightDistance.current < sensorData.rightDistance.threshold) {
                newSteering = this._steering.maxLeft;
            }

            // if(sensorData.leftDistance.current > sensorData.leftDistance.threshold && sensorData.rightDistance.current > sensorData.rightDistance.threshold) {
            //     newSteering = this._steering.center;
            // }
        } else if(!currState.canDriveForward && currState.canDriveBackward) {

            if(sensorData.rearDistance.current > sensorData.rearDistance.threshold) {
                newSpeed = 130;
            } else {
                newSpeed = this._throttle.allStop;
            }     

            if(sensorData.leftDistance.current < sensorData.rightDistance.current) {
                newSteering = this._steering.maxLeft;
            } else {
                newSteering = this._steering.maxRight;
            }
          
        }
        // } else if(!currState.canDriveForward && !currState.canDriveBackward) {
        //     Log.info('Bot can not move');
        //     // this._servoController.restartScriptAtSubroutine(3);
        //     // this.changeIntent(BotIntents.idle);
        //     return;
        // }
        
        // if(newSteering !== this._steering.current) {
            this._steering.current = newSteering;
            this._sensors.setDataValue('steeringRadio', this._steering.current);
            this._servoController.setTarget(2, parseInt(this._steering.current).map(0, 180, 640, 2304));
        // }

        // if(newSpeed !== this._throttle.current) {
            this._throttle.current = newSpeed;
            this._sensors.setDataValue('throttleRadio', this._throttle.current);
            // Log.info(`new forward speed ${this._throttle.current}`);
            this._servoController.setTarget(3, parseInt(this._throttle.current).map(0, 180, 640, 2304));
        // }
        // return;
        
    }

    handleRcInput() {
        const sensorData = this._sensors.getSensorDataSet();
        this._servoController.setTarget(2, parseInt(sensorData.steeringRadio.current).map(0, 180, 640, 2304));
        this._servoController.setTarget(3, parseInt(sensorData.throttleRadio.current).map(0, 180, 640, 2304));

    }

    handleHeadScan() {
        if (this._tickCount % 5 === 0) {
            const sensorData = this._sensors.getSensorDataSet();
            const angleStep = 1;
            let panValue = this._headScan.currentAngle;
            this._headScan.scanValues[panValue] = sensorData.headDistance.current; //load current value before movment to get a better signal
            this._botState.setStateValue('headScan', JSON.stringify(this._headScan.scanValues));
            if(this._headScan.panClockwise) {
                this._headScan.currentAngle = this._headScan.currentAngle + angleStep;
                if(this._headScan.currentAngle > this._headScan.maxAngle) {
                    this._headScan.currentAngle = this._headScan.maxAngle - angleStep;
                    this._headScan.panClockwise = false;
                }
            } else { 
                this._headScan.currentAngle = this._headScan.currentAngle - angleStep;
                if(this._headScan.currentAngle < this._headScan.minAngle) {
                    this._headScan.currentAngle = this._headScan.minAngle + angleStep;
                    this._headScan.panClockwise = true;
                }
            }
            this._sensors.setDataValue('panRadio', this._headScan.currentAngle);
            this._servoController.setTarget(1, parseInt(this._headScan.currentAngle).map(0, 360, 640, 2304));
        }
    }

}

module.exports = BotActions;