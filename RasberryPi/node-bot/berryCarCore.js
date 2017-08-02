var five = require("./johnny-five");
var keypress = require("keypress");
var temporal = require("temporal");
var board = new five.Board();
var net = require('net');

var steeringPort = 2001;
var throttlePort = 2002;
var steeringSocket = new net.Socket({
  allowHalfOpen: true
});
var throttleSocket = new net.Socket({
  allowHalfOpen: true
});

var distInch = 0;
var distCm = 0;
var movementStatus = 'stop';
var steeringStatus = 'center'



function sendSteeringMsg(msg) {
  
  steeringSocket.connect(steeringPort, function () {
    console.log('steering connected')
    steeringSocket.end(msg);
  });
  
}

function sendThrottleMsg(msg) {
  throttleSocket.connect(throttlePort, function () {
    console.log('throttle connected')
    throttleSocket.end(msg);
  });
}

board.on("ready", function() {

  var statusLed = new five.Led(13);
  var proxSensor = new five.Proximity({
    controller: "HCSR04",
    pin: "A0"
  });
  
  statusLed.blink();
  


  
  proxSensor.on("data", function() {
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
    
  });
});