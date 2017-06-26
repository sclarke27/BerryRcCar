const BotIntents = {
  startUp: {
    name: 'Start Up',
    rules: {
      start: (sensors, botActions) => {
        console.log('Bot entered startup state');
        botActions.handleStartUp();
      },
      end: (sensors, botActions) => {
        console.log(`Startup complete`);
      }
    }
  },
  idle: {
    name: 'Idle',
    rules: {
      start: (sensors, botActions) => {
        botActions.handleGoIdle();
        console.log('Bot entered idle state');
      },
      update: (sensors, botActions) => {
        botActions.handlePingSensors(sensors);
      },
      end: (sensorData, botActions) => {
        console.log('End idle state');
        console.log(`Leave idle state`);
      }
    }
  },
  driveForward: {
    name: 'Drive Forward',
    rules: {
      start: (sensors, botActions) => {
        console.log('Begin driving forward state');
        botActions.setCanDrive('forward', true);
        botActions.setCanDrive('backward', true);
      },
      update: (sensors, botActions) => {
        botActions.handlePingSensors(sensors, botActions);
        botActions.handleDriveForard(sensors, botActions);
        botActions.handleHeadsUpMovement(sensors, botActions)
      },
      end: (sensors, botActions) => {
        console.log('End driving forward state');
        console.log('Drive complete');
        botActions.setCanDrive('forward', false);
        botActions.setCanDrive('backward', false);
        botActions.setIsDriving(false);
      }
    }
  },
};

module.exports = BotIntents;