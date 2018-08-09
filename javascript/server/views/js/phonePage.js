class PhonePage {
  constructor() {
		this.magnetometerX = 0;
		this.magnetometerY = 0;
		this.magnetometerZ = 0;
    this.swimUrl = null;
		this.yCenterPoint = null;
  }

  start(swimUrl) {
    this.swimUrl = swimUrl;
    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", this.readOrientation, false);
    }
  }

  readOrientation(event) {
    if (event.alpha !== null) {
      let newYValue = Math.round(event.alpha);
      let newZValue = Math.round(event.beta);
      let newXValue = Math.round(event.gamma);

      if (newXValue !== this.magnetometerX || newYValue !== this.magnetometerY || newZValue !== this.magnetometerZ) {
        this.magnetometerX = newXValue;// - ((newZValue >= 0 && newZValue <= 90) ? 180 : 0);
        this.magnetometerY = newYValue;
        this.magnetometerZ = newZValue;

        if(this.magnetometerX < 0) {
          this.magnetometerX = this.magnetometerX + 180;
        }

        this.magnetometerY = this.magnetometerY + 180;
        if(this.magnetometerY > 360) {
          this.magnetometerY = this.magnetometerY - 360;
        }

        // let flipY = false;
        if (newXValue <= 0) {
          this.magnetometerX = newXValue * -1;
        } else if (newXValue > 0 && newXValue <= 90) {
          this.magnetometerX = this.map(newXValue, 90, 0, 90, 180);
        } else {
          this.magnetometerX = newXValue;
        }

        if (this.magnetometerX > 0) {
          this.magnetometerY = this.map(newYValue, 0, 360, 360, 0);
        }
        if (this.magnetometerX >= 90) {
          this.magnetometerY = this.constrain((this.magnetometerY - 180), 0, 360);
        }


        if (this.yCenterPoint === null) {
          this.yCenterPoint = this.constrain((this.magnetometerY - 180), 0, 360);
          if (this.yCenterPoint > 360) {
            this.yCenterPoint = this.yCenterPoint - 360;
          }
        }
        this.magnetometerY = this.constrain((this.magnetometerY - this.yCenterPoint), 0, 360);


        document.getElementById("magnetometerXR").innerHTML = this.magnetometerX;
        document.getElementById("magnetometerYR").innerHTML = this.magnetometerY;
        document.getElementById("magnetometerZR").innerHTML = this.magnetometerZ;
        document.getElementById("magnetometerXL").innerHTML = this.magnetometerX;
        document.getElementById("magnetometerYL").innerHTML = this.magnetometerY;
        document.getElementById("magnetometerZL").innerHTML = this.magnetometerZ;
        this.setSensorValue('Mag', this.magnetometerX, this.magnetometerY, this.magnetometerZ);
      }
    }
  }

  sendCommand(channel, value) {
    console.info(channel, value)
    swim.client.command(this.swimUrl, `/sensor/${channel}`, 'addLatest', parseInt(value));
  }
  
  setSensorValue(channel, x, y, z) {
    this.sendCommand('phoneMagX', x);
    this.sendCommand('phoneMagY', y);
    this.sendCommand('phoneMagZ', z);

    return false;
  }  

  map(x, in_min, in_max, out_min, out_max) {
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
  }

  constrain(curr, min, max) {
    let returnValue = curr;
    if (curr < min) {
      returnValue = max + curr;
    }
    if (curr > max) {
      returnValue = max - curr;
    }
    return returnValue;
  }  
}




		// let magnetometerX = 0;
		// let magnetometerY = 0;
		// let magnetometerZ = 0;

		// let yCenterPoint = null;

		// function map(x, in_min, in_max, out_min, out_max) {
		// 	return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
		// }

		// function constrain(curr, min, max) {
		// 	let returnValue = curr;
		// 	if (curr < min) {
		// 		returnValue = max + curr;
		// 	}
		// 	if (curr > max) {
		// 		returnValue = max - curr;
		// 	}
		// 	return returnValue;
		// }

		// function orientation(event) {
		// 	if (event.alpha !== null) {
		// 		newYValue = Math.round(event.alpha);
		// 		newZValue = Math.round(event.beta);
		// 		newXValue = Math.round(event.gamma);

		// 		if (newXValue !== magnetometerX || newYValue !== magnetometerY || newZValue !== magnetometerZ) {
		// 			magnetometerX = newXValue;// - ((newZValue >= 0 && newZValue <= 90) ? 180 : 0);
		// 			magnetometerY = newYValue;
		// 			magnetometerZ = newZValue;

		// 			if(magnetometerX < 0) {
		// 				magnetometerX = magnetometerX + 180;
		// 			}

		// 			magnetometerY = magnetometerY + 180;
		// 			if(magnetometerY > 360) {
		// 				magnetometerY = magnetometerY - 360;
		// 			}

		// 			flipY = false;
		// 			if (newXValue <= 0) {
		// 				magnetometerX = newXValue * -1;
		// 			} else if (newXValue > 0 && newXValue <= 90) {
		// 				magnetometerX = map(newXValue, 90, 0, 90, 180);
		// 			} else {
		// 				magnetometerX = newXValue;
		// 			}

		// 			if (magnetometerX > 0) {
		// 				magnetometerY = map(newYValue, 0, 360, 360, 0);
		// 			}
		// 			if (magnetometerX >= 90) {
		// 				magnetometerY = constrain((magnetometerY - 180), 0, 360);
		// 			}


		// 			if (yCenterPoint === null) {
		// 				yCenterPoint = constrain((magnetometerY - 180), 0, 360);
		// 				if (yCenterPoint > 360) {
		// 					yCenterPoint = yCenterPoint - 360;
		// 				}
		// 			}
		// 			magnetometerY = constrain((magnetometerY - yCenterPoint), 0, 360);


		// 			document.getElementById("magnetometerXR").innerHTML = magnetometerX;
		// 			document.getElementById("magnetometerYR").innerHTML = magnetometerY;
		// 			document.getElementById("magnetometerZR").innerHTML = magnetometerZ;
		// 			document.getElementById("magnetometerXL").innerHTML = magnetometerX;
		// 			document.getElementById("magnetometerYL").innerHTML = magnetometerY;
		// 			document.getElementById("magnetometerZL").innerHTML = magnetometerZ;
		// 			setSensorValue('Mag', magnetometerX, magnetometerY, magnetometerZ);
		// 		}
		// 	}
		// }

		// function setSensorValue(channel, x, y, z) {
		// 	sendCommand('phoneMagX', x);
		// 	sendCommand('phoneMagY', y);
		// 	sendCommand('phoneMagZ', z);

		// 	return false;
		// }

		// function go() {
		// 	if (window.DeviceOrientationEvent) {
		// 		window.addEventListener("deviceorientation", orientation, false);
		// 	}
		// }

		// function sendCommand(channel, value) {
		// 	console.info(channel, value)
		// 	this.swimUrl = '{{fullSwimUrl}}';
		// 	swim.client.command(this.swimUrl, `/sensor/${channel}`, 'addLatest', parseInt(value));
		// }