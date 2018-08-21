class GroundStationPage {
  constructor() {
    this.swimUrl = null;
    this.leftCanvas = null;
    this.rightCanvas = null;
    this.defaultCanvasWidth = 640;
    this.defaultCanvasHeight = 480;

    this.rightFaceList = null;
    this.leftFaceList = null;
    this.currThrottle = 0;
    this.currSteering = 0;

    // these 3 values will be set automatically based on the size of the actual canvas on the page
    this.canvasWidth = this.defaultCanvasWidth;
    this.canvasHeight = this.defaultCanvasHeight;
    this.canvasScaling = 1;
  }

  start(swimUrl) {
    this.swimUrl = swimUrl;

    var left = document.getElementById("leftEyeCanvas");
    this.leftCanvas = left.getContext("2d");

    var right = document.getElementById("rightEyeCanvas");
    this.rightCanvas = right.getContext("2d");

    this.canvasWidth = right.offsetWidth;
    this.canvasHeight = right.offsetHeight;
    this.canvasScaling = this.canvasWidth / this.defaultCanvasWidth;

    swim.downlinkValue()
      .host(this.swimUrl)
      .node('/botState')
      .lane('leftEyeFaces')
      .didSet((newValue) => {
        const data = eval(newValue)
        this.leftFaceList = data;
      })
      .open();  

    swim.downlinkValue()
    .host(this.swimUrl)
    .node('/botState')
    .lane('rightEyeFaces')
    .didSet((newValue) => {
      const data = eval(newValue);
      this.rightFaceList = data;
    })
    .open();        

    swim.downlinkValue()
      .host(this.swimUrl)
      .node('/sensor/throttleRadio')
      .lane('latest')
      .didSet((newValue) => {
        const data = eval(newValue)
        this.currThrottle = data;
      })
      .open();  

    swim.downlinkValue()
      .host(this.swimUrl)
      .node('/sensor/steeringRadio')
      .lane('latest')
      .didSet((newValue) => {
        const data = eval(newValue)
        this.currSteering = data;
      })
      .open();  

    this.tileValueElem = null;
    this.panValueElem = null;
    swim.downlinkValue()
      .host(this.swimUrl)
      .node('/sensor/tiltRadio')
      .lane('latest')
      .didSet((newValue) => {
        if(!this.tileValueElem) {
          this.tileValueElem = document.getElementById('tiltValueLabel');
        }
        if(this.tileValueElem) {
          this.tileValueElem.innerHTML = newValue + "&deg;";
        }

      })
      .open();

    swim.downlinkValue()
      .host(this.swimUrl)
      .node('/sensor/panRadio')
      .lane('latest')
      .didSet((newValue) => {
        if(!this.panValueElem) {
          this.panValueElem = document.getElementById('panValueLabel');
        }
        if(this.panValueElem) {
          this.panValueElem.innerHTML = newValue + "&deg;";
        }
      })
      .open();      

    this.compassValueElem = null;
    this.compassCircleElem = null;
    swim.downlinkValue()
      .host(this.swimUrl)
      .node('/sensor/compass1')
      .lane('latest')
      .didSet((newValue) => {
        if(!this.compassValueElem) {
          this.compassValueElem = document.getElementById('compassValue');
        }
        if(!this.compassCircleElem) {
          this.compassCircleElem = document.getElementById('compassCircle');
        }
        if(this.compassValueElem) {
          this.compassValueElem.innerHTML = newValue + "&deg;";
        }
        if(this.compassCircleElem) {
          this.compassCircleElem.style.transform = 'perspective(500px) rotateX(72deg) rotateY(0deg) rotateZ(' + newValue + 'deg)';
        }
      })
      .open();       

    setInterval(() => {
      this.clearCanvas(this.leftCanvas);
      this.clearCanvas(this.rightCanvas);

      if(this.leftFaceList) {
        this.updateFaceBoundingBoxes(this.leftCanvas, this.leftFaceList);
      }
      if(this.rightFaceList) {
        this.updateFaceBoundingBoxes(this.rightCanvas, this.rightFaceList);
      }

      this.drawThrottle(this.leftCanvas, this.currThrottle, 0);
      this.drawThrottle(this.rightCanvas, this.currThrottle, 0);

      this.drawSteering(this.leftCanvas, this.currSteering, 0);
      this.drawSteering(this.rightCanvas, this.currSteering, 0);

  
    }, 1/30);

  }

  drawThrottle(canvas, throttleValue, eyeOffset) {
    const totalTicks = 40;
    const gutterWidth = 20;
    const containerHeight = this.canvasHeight-gutterWidth;
    const tickTopDistance = containerHeight / totalTicks;
    let tickWidth = gutterWidth;
    let tickLeft = this.canvasWidth - tickWidth;
    const bgGrad = canvas.createLinearGradient(0, 0, gutterWidth, containerHeight);
    bgGrad.addColorStop(0.05, "rgba(255, 0, 0, 0.75)");
    bgGrad.addColorStop(0.25, "rgba(255, 255, 0, 0.75)");
    bgGrad.addColorStop(0.35, "rgba(0, 255, 0, 0.75)");
    bgGrad.addColorStop(0.5, "rgba(0, 0, 0, 0.500)");
    bgGrad.addColorStop(0.85, "rgba(0, 255, 0, 0.75)");
    bgGrad.addColorStop(0.90, "rgba(255, 255, 0, 0.75)");
    bgGrad.addColorStop(1, "rgba(255, 0, 0, 0.75)");
    canvas.fillStyle=bgGrad;
    canvas.fillRect(this.canvasWidth-gutterWidth, 0, 25, containerHeight);
    this.drawLine(canvas, this.canvasWidth-gutterWidth+eyeOffset, 0, this.canvasWidth-gutterWidth+eyeOffset, this.canvasHeight, 2, "rgba(0, 0, 0, 0.25)");            
    this.drawLine(canvas, this.canvasWidth+eyeOffset, 0, this.canvasWidth+eyeOffset, this.canvasHeight, 2, "rgba(0, 0, 0, 0.25)");            
    for(let tickIndex = 0; tickIndex <= totalTicks; tickIndex++) {
      tickLeft = this.canvasWidth - gutterWidth;
      const currTop = Math.floor(tickTopDistance*tickIndex);
      this.drawLine(canvas, tickLeft+eyeOffset, currTop, this.canvasWidth+eyeOffset, currTop, 1, (tickIndex % 5 === 0) ? "rgba(0, 0, 0, 0.75)" : "rgba(100, 100, 100, 0.5");            
    }
    tickLeft = this.canvasWidth - tickWidth - 1;
    throttleValue = this.map(throttleValue, 0, 180, 0, containerHeight)
    this.drawBox(canvas, tickLeft+eyeOffset, throttleValue-2, this.canvasWidth+eyeOffset, throttleValue-2, 2, "#FF7272");            
    this.drawBox(canvas, tickLeft+eyeOffset-1, throttleValue, this.canvasWidth+eyeOffset, throttleValue, 2, "#FF0000");            
    this.drawBox(canvas, tickLeft+eyeOffset, throttleValue+2, this.canvasWidth+eyeOffset, throttleValue+2, 2, "#CC0000");            
  }

  drawSteering(canvas, steeringValue, eyeOffset) {
    const totalTicks = 40;
    const gutterHeight = 20;
    const containerWidth = this.canvasWidth - gutterHeight;
    const tickDistance = containerWidth / totalTicks;
    let tickHeight = gutterHeight;
    let tickLeft = this.canvasWidth - 1;
    const bgGrad = canvas.createLinearGradient(0, 0, containerWidth, gutterHeight);
    bgGrad.addColorStop(0, "rgba(0, 255, 0, 0.75)");
    bgGrad.addColorStop(0.5, "rgba(0, 255, 0, 0.0)");
    bgGrad.addColorStop(1, "rgba(0, 255, 0, 0.75)");
    canvas.fillStyle=bgGrad;
    canvas.fillRect(0, this.canvasHeight-gutterHeight, containerWidth, gutterHeight);
    this.drawLine(canvas, 0, this.canvasHeight-gutterHeight, containerWidth-gutterHeight+eyeOffset, this.canvasHeight-gutterHeight, 2, "rgba(0, 0, 0, 0.25)");            
    this.drawLine(canvas, 0, this.canvasHeight+eyeOffset, containerWidth+eyeOffset, this.canvasHeight, 2, "rgba(0, 0, 0, 0.25)");            
    
    for(let tickIndex = 0; tickIndex <= totalTicks; tickIndex++) {
      tickLeft = tickDistance * tickIndex;
      let tickTop = this.canvasHeight - tickHeight
      this.drawLine(canvas, tickLeft+eyeOffset, tickTop, tickLeft+eyeOffset, this.canvasHeight, 1, "rgba(0,0,0,0.75");            
    }
    steeringValue = this.map(steeringValue, 0, 180, 0, containerWidth)
    this.drawLine(canvas, steeringValue-2+eyeOffset, this.canvasHeight-tickHeight, steeringValue-2+eyeOffset, this.canvasHeight, 2, "rgba(100, 255, 100, 0.5)");            
    this.drawLine(canvas, steeringValue+eyeOffset, this.canvasHeight-tickHeight-1, steeringValue+eyeOffset, this.canvasHeight, 2, "rgba(0, 255, 0, 0.8");            
    this.drawLine(canvas, steeringValue+2+eyeOffset, this.canvasHeight-tickHeight, steeringValue+2+eyeOffset, this.canvasHeight, 2, "rgba(100, 255, 100, 0.5)");            
  }

  clearCanvas(canvas) {
    // Store the current transformation matrix
    canvas.save();

    // Use the identity matrix while clearing the canvas
    canvas.setTransform(1, 0, 0, 1, 0, 0);
    canvas.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Restore the transform
    canvas.restore();    
  }

  updateFaceBoundingBoxes(canvas, data) {
    
    for(const face of data) {
      // console.info(face);
      const scale = this.canvasScaling;
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

  drawLine(canvas, x1, y1, x2, y2, size = 1, color = "#ffffff") {
    canvas.strokeStyle=color;
    canvas.lineWidth=size;
    canvas.beginPath();
    canvas.moveTo(x1, y1);
    canvas.lineTo(x2, y2);
    canvas.stroke();
  }

  sendIntCommand(channel, lane, value) {
    // console.info(channel, lane, value)
    swim.client.command(this.swimUrl, channel, lane, parseInt(value));
  }
  
  sendStrCommand(channel, lane, value) {
    // console.info(channel, value)
    swim.client.command(this.swimUrl, channel, lane, value);
  }

  setIntent(newIntent) {
    this.sendStrCommand('/botState', 'setCurrentIntent', newIntent);
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
