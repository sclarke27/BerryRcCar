class PhonePage {
  constructor() {
		this.magnetometerX = 0;
		this.magnetometerY = 0;
		this.magnetometerZ = 0;
    this.swimUrl = null;
    this.yCenterPoint = null;
    this.leftCanvas = null;
    this.rightCanvas = null;
  }

  start(swimUrl) {
    this.swimUrl = swimUrl;
    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", this.readOrientation.bind(this), false);
    }

    var left = document.getElementById("leftEyeCanvas");
    this.leftCanvas = left.getContext("2d");

    var right = document.getElementById("rightEyeCanvas");
    this.rightCanvas = right.getContext("2d");

    // this.leftCanvas.beginPath();
    // this.leftCanvas.moveTo(0,0);
    // this.leftCanvas.lineTo(300,150);
    // this.leftCanvas.stroke();    

    // this.rightCanvas.beginPath();
    // this.rightCanvas.moveTo(0,0);
    // this.rightCanvas.lineTo(300,150);
    // this.rightCanvas.stroke();    
    
    this.drawBox(this.leftCanvas, 10, 20, 200, 220)
    this.drawBox(this.rightCanvas, 10, 20, 200, 220)
  }

  drawBox(canvas, x1, y1, x2, y2) {
    canvas.beginPath();
    canvas.moveTo(x1, y1);
    canvas.lineTo(x1, y2);
    canvas.lineTo(x2, y2);
    canvas.lineTo(x2, y1);
    canvas.lineTo(x1, y1);
    canvas.stroke();
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
    // console.info(channel, value)
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
