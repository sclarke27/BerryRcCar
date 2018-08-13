class GroundStationPage {
  constructor() {
    this.swimUrl = null;
    this.leftCanvas = null;
    this.rightCanvas = null;
    this.defaultCanvasWidth = 640;
    this.defaultCanvasHeight = 480;

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
        this.clearCanvas(this.leftCanvas);
        this.drawThrottle(this.leftCanvas);
        this.drawSteering(this.leftCanvas);
        this.updateFaceBoundingBoxes(this.leftCanvas, data);
  
      })
      .open();  

    swim.downlinkValue()
    .host(this.swimUrl)
    .node('/botState')
    .lane('rightEyeFaces')
    .didSet((newValue) => {
      const data = eval(newValue)
      this.clearCanvas(this.rightCanvas);
      this.drawThrottle(this.rightCanvas);
      this.drawSteering(this.rightCanvas);
      this.updateFaceBoundingBoxes(this.rightCanvas, data);
    })
    .open();        

  }

  drawThrottle(canvas) {
    const totalTicks = 20;
    const tickTopDistance = this.canvasHeight / totalTicks;
    let tickWidth = 10;
    let tickLeft = this.canvasWidth - tickWidth;
    for(let tickIndex = 0; tickIndex <= totalTicks; tickIndex++) {
      tickWidth = (tickIndex % 5 === 0) ? 20 : 10;
      tickLeft = this.canvasWidth - tickWidth;
      const currTop = tickTopDistance*tickIndex;
      this.drawBox(canvas, tickLeft, currTop, this.canvasWidth, currTop, "#ffffff");            
    }
  }

  drawSteering(canvas) {
    const totalTicks = 20;
    const tickDistance = this.canvasWidth / totalTicks;
    let tickHeight = 10;
    let tickLeft = this.canvasWidth - 1;
    for(let tickIndex = 0; tickIndex <= totalTicks; tickIndex++) {
      tickHeight = (tickIndex % 5 === 0) ? 20 : 10;
      tickLeft = tickDistance * tickIndex;
      let tickTop = this.canvasHeight - tickHeight
      this.drawBox(canvas, tickLeft, tickTop, tickLeft+1, this.canvasHeight, "#ffffff");            
    }
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

  sendIntCommand(channel, lane, value) {
    // console.info(channel, value)
    swim.client.command(this.swimUrl, channel, lane, parseInt(value));
  }
  
  sendStrCommand(channel, lane, value) {
    // console.info(channel, value)
    swim.client.command(this.swimUrl, channel, lane, value);
  }

  setIntent(newIntent) {
    switch(newIntent) {
      case 'drive':
        this.sendStrCommand('/botState', 'setCurrentIntent', 'driveByRC');
        break;
      case 'arOnly':
        this.sendStrCommand('/botState', 'setCurrentIntent', 'arOnly');
        break;
      default:
      case 'idle':
        this.sendStrCommand('/botState', 'setCurrentIntent', 'idle');
        break;
      
    }
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
