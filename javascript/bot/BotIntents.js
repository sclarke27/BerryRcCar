const Log = require('../utils/Log');

const BotIntents = {
  startUp: {
    name: 'Start Up',
    rules: {
      start: (sensors, botActions) => {
        Log.info('Bot entered startup state');
        if(botActions.handleStartUp()) {
          botActions.changeIntent(BotIntents.idle);
        } else {
          Log.error('error starting bot');
        }
      },
      end: (sensors, botActions) => {
        Log.info(`Startup complete`);
      }
    }
  },
  idle: {
    name: 'Idle',
    rules: {
      start: (sensors, botActions) => {
        botActions.handleGoIdle();
        Log.info('Bot entered idle state');
      },
      update: (sensors, botActions) => {
        // botActions.handlePingSensors(sensors);
      },
      end: (sensorData, botActions) => {
        Log.info('End idle state');
        Log.info(`Leave idle state`);
      }
    }
  },
  arOnly: {
    name: 'AR HUD Only',
    rules: {
      start: (sensors, botActions) => {
        botActions.handleGoIdle();
        Log.info('Bot entered AR HUD only state');
      },
      update: (sensors, botActions) => {
        botActions.handleHeadsUpMovement();
      },
      end: (sensorData, botActions) => {
        Log.info('End AR HUD state');
      }
    }
  },  
  driveByRC: {
    name: 'Drive By RC',
    rules: {
      start: (sensors, botActions) => {
        Log.info('Begin driving forward state');
        // botActions.setCanDrive('forward', true);
        // botActions.setCanDrive('backward', true);
      },
      update: (sensors, botActions) => {
        botActions.handlePingSensors();
        botActions.handleHeadsUpMovement();
        botActions.handleRcInput();
      },
      end: (sensors, botActions) => {
        Log.info('Drive complete');
        // botActions.setCanDrive('forward', false);
        // botActions.setCanDrive('backward', false);
        // botActions.setIsDriving(false);
      }
    }
  },
};

module.exports = BotIntents;