const Log = require('../utils/Log');

const BotIntents = {
  startUp: {
    name: 'Start Up',
    rules: {
      start: (sensors, botActions) => {
        Log.info('Bot entered startup state');
        if(botActions.handleStartUp()) {
          setTimeout(() => {
            botActions.changeIntent(BotIntents.idle);
          }, 1000);          
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
        botActions.handlePingSensors();
        botActions.handleManualHeadMovement();
      },
      end: (sensorData, botActions) => {
        Log.info('End idle state');
      }
    }
  },
  arOnly: {
    name: 'AR HUD Only',
    rules: {
      start: (sensors, botActions) => {
        botActions.resetAllToDefaultState();
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
  headScan: {
    name: "Head Scanner Mode",
    rules: {
      start: (sensors, botActions) => {
        botActions.resetAllToDefaultState();
        Log.info('Begin head scan mode');
      },
      update: (sensors, botActions) => {
        // botActions.handlePingSensors();
        // botActions.handleAutoDrive();
        botActions.handleHeadScan();
      },
      end: (sensors, botActions) => {
        Log.info('scan complete');
      }
    }
  },  
  autoDrive: {
    name: "Automous Drive Mode",
    rules: {
      start: (sensors, botActions) => {
        botActions.resetAllToDefaultState();
        botActions.handlePingSensors();
        Log.info('Begin autonomous driving state');
      },
      update: (sensors, botActions) => {
        botActions.handlePingSensors();
        botActions.handleAutoDrive();
      },
      end: (sensors, botActions) => {
        botActions.resetAllToDefaultState();
        Log.info('Drive complete');
      }
    }
  },
  botHeadSync: {
    name: "Bot Head Sync Mode",
    rules: {
      start: (sensors, botActions) => {
        botActions.resetAllToDefaultState();
        // botActions.handlePingSensors();
        Log.info('Begin head sync state state');
      },
      update: (sensors, botActions) => {
        botActions.handlePingSensors();
        botActions.handleBotHeadSync();
      },
      end: (sensors, botActions) => {
        botActions.resetAllToDefaultState();
        Log.info('sync complete');
      }
    }
  }  
};

module.exports = BotIntents;