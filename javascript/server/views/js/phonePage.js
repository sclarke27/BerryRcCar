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
    
    // this.botSensorLane = this.mapDownlink.node('/bot/'+this.botName).lane('join/latest')
    // .didUpdate((key, value) => {
    //     if(this.botSensorValues[key] !== value) {
    //         this.botSensorValues[key] = value;
    //         this.updateData(this.botData);
    //     }
    // });    

    swim.downlinkValue()
      .host(`ws://192.168.1.106:5620`)
      .node('/botState')
      .lane('leftEyeFaces')
      .didSet((newValue) => {
        const data = eval(newValue)
        this.updateFaceBoundingBoxes(this.leftCanvas, data);
  
      })
      .open();  

    swim.downlinkValue()
    .host(`ws://192.168.1.106:5620`)
    .node('/botState')
    .lane('rightEyeFaces')
    .didSet((newValue) => {
      const data = eval(newValue)
      this.updateFaceBoundingBoxes(this.rightCanvas, data);
    })
    .open();        

  }

  drawBox(canvas, x1, y1, x2, y2) {
    canvas.beginPath();
    canvas.moveTo(x1, y1);
    canvas.lineTo(x2, y1);
    canvas.lineTo(x2, y2);
    canvas.lineTo(x1, y2);
    canvas.lineTo(x1, y1);
    canvas.stroke();
  }

  clearCanvas(canvas) {
    // Store the current transformation matrix
    canvas.save();

    // Use the identity matrix while clearing the canvas
    canvas.setTransform(1, 0, 0, 1, 0, 0);
    canvas.clearRect(0, 0, 640, 480);

    // Restore the transform
    canvas.restore();    
  }

  updateFaceBoundingBoxes(canvas, data) {
    this.clearCanvas(canvas);
    for(const face of data) {
      // console.info(face);
      const scale = 0.75;
      const x1 = face.x1*scale;
      const y1 = face.y1*scale;
      const x2 = face.x2*scale;
      const y2 = face.y2*scale;
      
      this.drawBox(canvas, x1, y1, x2, y2, 3, "#0000FF");        
      if(face.eyes.length > 0) {
        for(const eye of face.eyes) {
          const eyeX1 = x1 + (eye.x1*scale);
          const eyeY1 = y1 + (eye.y1*scale);
          const eyeX2 = eyeX1 + (eye.width*scale);
          const eyeY2 = eyeY1 + (eye.height*scale);
          this.drawBox(canvas, eyeX1, eyeY1, eyeX2, eyeY2, 3, "#00ff00");            
        }
      }
    }

    var left = document.getElementById("leftEyeCanvas");
    this.leftCanvas = left.getContext("2d");

    var right = document.getElementById("rightEyeCanvas");
    this.rightCanvas = right.getContext("2d");

  }

  drawBox(canvas, x1, y1, x2, y2, size = 1, color = "#ffffff") {
    canvas.strokeStyle=color;
    canvas.lineWidth=size;
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
