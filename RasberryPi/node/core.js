var net = require('net');
var SerialPort = require('serialport');
var Readline = SerialPort.parsers.Readline;
var port = new SerialPort('/dev/ttyACM0', {
  baudRate: 115200
});
var parser = new Readline();
port.pipe(parser);

port.on('open', function(err) {
  console.log('opened');
});

port.on('error', function(err) {
  console.log('err:', err.message);
});

parser.on('data', function(data) {
  handleSensorData(data);
  
});

var SensorData = {
  dist1: 0,
  dist2: 0,
  rc1: 0,
  rc2: 0,
  compass:0
}

function handleSensorData(sensorData) {

  var dataArray = sensorData.split(',');
  if(dataArray) {
    for(var i = 0; i < dataArray.length; i++) {
      var dataCommand = dataArray[i];
      //console.log(dataCommand);
      var cmdArr = dataCommand.split(':');
      if(cmdArr && cmdArr.length == 2) {
	//cmdArr[1] = cmdArr[1].replace('\r','');
	if(SensorData.hasOwnProperty(cmdArr[0])) {
	  SensorData[cmdArr[0]] = cmdArr[1];
	}
      }
    }
  }
  
}

var steeringPort = 2001;
var throttlePort = 2002;
var movementStatus = '';
var steeringStatus = ''
var steeringSocket = new net.Socket({
  allowHalfOpen: false
});
var throttleSocket = new net.Socket({
  allowHalfOpen: false
});
function sendSteeringMsg(msg) {
  steeringSocket.connect(steeringPort, function () {
    console.log('steering msg', msg);
    steeringSocket.end(msg);
  });
}

function sendThrottleMsg(msg) {
  throttleSocket.connect(throttlePort, function () {
    console.log('throttle msg', msg);
    throttleSocket.end(msg);
  });
}

setInterval( () => {
  //console.log(SensorData);
  if(SensorData.rc1 <= -100) {
    if(movementStatus != 'forward') {
      sendThrottleMsg('forward');
      movementStatus = 'forward';
    }
  } else if(SensorData.rc1 >= 100) {
    if(movementStatus != 'reverse') {
      sendThrottleMsg('reverse');
      movementStatus = 'reverse';
    }
  } else {
    if(movementStatus != 'stop') {
      sendThrottleMsg('stop');
      movementStatus = 'stop';
    }
  }
  
  if(SensorData.rc2 <= -100) {
    if(steeringStatus != 'left') {
      sendSteeringMsg('left');
      steeringStatus = 'left';
    }
  } else if(SensorData.rc2 >= 100) {
    if(steeringStatus != 'right') {
      sendSteeringMsg('right');
      steeringStatus = 'right';
    }
  } else {
    if(steeringStatus != 'center') {
      sendSteeringMsg('center');
      steeringStatus = 'center';
    }
  }
}, 10);