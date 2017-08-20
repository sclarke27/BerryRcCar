const BotIntents = {
  startUp: {
    name: 'Start Up',
    rules: {
      start: (sensorData, botActions) => {
        console.log('Bot entered startup state');
        botActions.wakeUp();
      },
      update: (sensorData, botActions) => {
        botActions.changeIntent(BotIntents.idle);
      },
      end: (sensorData, botActions) => {
        console.log(`Startup complete`);
      }
    }
  },
  idle: {
    name: 'Idle',
    rules: {
      start: (sensorData, botActions) => {
        botActions.allStop();
        console.log('Bot entered idle state');
      },
      end: (sensorData, botActions) => {
        console.log(`Leave idle state`);
      }
    }
  },
  driveForward: {
    name: 'Drive Forward',
    rules: {
      start: (sensorData, botActions) => {
        console.log('Begin driving forward state');
      },
      update: (sensorData, botActions) => {
        botActions.handleDriveFromRC();
      },
      end: (sensorData, botActions) => {
        console.log(`Drive complete`);
      }
    }
  },
};

module.exports = BotIntents;
