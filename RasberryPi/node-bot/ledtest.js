var five = require("./johnny-five");
var keypress = require("keypress");
var board = new five.Board();



board.on("ready", function() {

  var statusLed = new five.Led(13);
  
  statusLed.blink();

  
});