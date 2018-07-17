const HttpConfig = {
	httpEnabled: true,
	showDebug: false,
	botName: 'RaspiAgg9',
	hostUrl: '192.168.1.82',
	aggregateHost: 'plantMon.swim.ai',
	hostPort: 8080,
	swimPort: 5620,
	senseHatConfig: {
		bot: {
			enabled: false,
		},
		service: {
			enabled: false,
			polling: {
				enabled: true,
				interval: 100
			}			
		}
	},
	plantConfig: {
		bot: {
			enabled: false,
			updateInterval: {
				enabled: false,
				intervalTimeout: 1000, // in milliseconds
			},
		},
		service: {
			enabled: false,
			arduinoAddress: '/dev/ttyACM0',
			baud: 115200,
			polling: {
				enabled: true,
				interval: 100
			}
		}
	}
}


module.exports = HttpConfig;
