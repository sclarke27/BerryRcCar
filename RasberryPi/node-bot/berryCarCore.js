var five = require("./johnny-five");
var keypress = require("keypress");
var temporal = require("temporal");
var board = new five.Board();
var net = require('net');

var steeringPort = 2001;
var throttlePort = 2002;
var movementStatus = 'stop';
var steeringStatus = 'center'
var pythonSocket = new net.Socket({
  allowHalfOpen: true
});



function sendSteeringMsg(msg) {
  pythonSocket.connect(steeringPort, function () {
    console.log('steering connected')
    pythonSocket.end(msg);
  });
}

function sendThrottleMsg(msg) {
  pythonSocket.connect(throttlePort, function () {
    console.log('throttle connected')
    pythonSocket.end(msg);
  });
}

function sendTiltPan(msg) {
  pythonSocket.connect(steeringPort, function () {
    pythonSocket.end(msg);
  });
}

function handleKeyPress(ch, key) {
  console.log(`keypress ${key.name}`);
}

function ProximityHandler() {
  this.rightDistInch = 0;
  this.rightDistCm = 0;
  this.leftDistInch = 0;
  this.leftDistCm = 0;
  this.rightProxSensor = null;
  this.leftProxSensor = null;
}

ProximityHandler.prototype.startSensors = function() {
  this.rightProxSensor = new five.Proximity({
    controller: "HCSR04",
    pin: "A0"
  });
  this.leftProxSensor = new five.Proximity({
    controller: "HCSR04",
    pin: "A1"
  });
  
}

ProximityHandler.prototype.setDistance = function(side, inches, cm) {
  switch(side) {
    case "left":
      this.leftDistInch = inches;
      this.leftDistCm = cm;
      break;
    case "right":
      this.rightDistInch = inches;
      this.rightDistCm = cm;
      break;
  }
}

ProximityHandler.prototype.getDistance = function(side) {
  var returnDist = {
    inches: 0,
    cm: 0
  };
  switch(side) {
    case "left": 
      returnDist.inches = this.leftDistInch;
      returnDist.cm = this.leftDistCm;
      break;
    case "right": 
      returnDist.inches = this.rightDistInch;
      returnDist.cm = this.rightDistCm;
      break;
  }
  return returnDist;
}  

ProximityHandler.prototype.startListeners = function() {
  var that = this;
  this.leftProxSensor.on("data", function() {
    that.setDistance('left', this.inches, this.cm);
  });
  
  this.rightProxSensor.on("data", function() {
    that.setDistance('right', this.inches, this.cm);
  });    
}


sendTiltPan("testTiltPan");

board.on("ready", function() {

  var _proximityHandler = new ProximityHandler()
  var statusLed = new five.Led(13);

  _proximityHandler.startSensors();
  _proximityHandler.startListeners();
  
  keypress(process.stdin);
  process.stdin.on("keypress", handleKeyPress);
  process.stdin.setRawMode(true);
  process.stdin.resume();  

  this.loop(500, function () {
    var rightDist = _proximityHandler.getDistance("right");
    var leftDist = _proximityHandler.getDistance("left");
    console.log(`right prox= ${rightDist.inches}in ${rightDist.cm}cm | left prox= ${leftDist.inches}in ${leftDist.cm}cm`);
  });

  statusLed.blink();
  
});

function handleDriving() {
    var newMovementStatus = movementStatus;
    var newSteeringStatus = steeringStatus;
    if(this.inches > 0 && this.cm > 0) {
      distInch = this.inches
      distCm = this.cm;
      //console.log("in:", this.inches);
      //console.log("cm:", this.cm);
      if(distInch > 4) {
	newMovementStatus = 'forward';
	newSteeringStatus = 'center';
      } else {
	newMovementStatus = 'stop';
	newSteeringStatus = 'left';
      }
    } else {
      newMovementStatus = 'stop';
      newSteeringStatus = 'center';
    }
    if(newMovementStatus !== movementStatus) {
      movementStatus = newMovementStatus;
      sendThrottleMsg(movementStatus);
    }
    if(newSteeringStatus !== steeringStatus) {
      steeringStatus = newSteeringStatus;
      sendSteeringMsg(steeringStatus);
    }  

}