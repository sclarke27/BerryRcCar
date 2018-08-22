const HttpConfig = {
	httpEnabled: true,
	showDebug: false,
	botName: 'RaspiAgg9',
	hostUrl: '192.168.1.82',
	hostPort: 8080,
	swimUrl: '192.168.1.106',
	swimPort: 5620,
	cameras: {
		address: '192.168.1.106',
		leftEyePort: 8081,
		rightEyePort: 8082,
	},
	arduino: {
		address: '/dev/ttyACM0',
		baud: 115200,
	},
	servoController: {
		address: '/dev/ttyACM1',
		baud: 115200,
	}
}


module.exports = HttpConfig;
