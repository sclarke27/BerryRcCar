const HttpConfig = {
	httpEnabled: true,
	showDebug: true,
	hostUrl: '192.168.1.71',
	aggregateHost: '192.168.1.71',
	hostPort: 8080,
	swimPort: 5620,
	botName: 'RaspiRover0',
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
			consumer_key: '',
			consumer_secret: '',
			access_token: '',
			access_token_secret: '',
			randomTweet: {
				enabled: false,
				intervalTimeout: 1000 * 120, // in milliseconds
			},
			trackFollowers: {
				enabled: false,
				intervalTimeout: 1000 * 60 * 120, // in milliseconds
			}
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
