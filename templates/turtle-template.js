document.body.innerHTML = `
  <style>
    body {
      margin: 0px;
    }
    
    main {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100vw;
      height: 100vh;
      background: darkgrey;
      overflow: scroll;
    }

    canvas {
      background: white;
    }
  </style>

  <main>
    <canvas></canvas>
  </main>
`

class Turtle {
  constructor(canvas) {
    this._drawing = true;
    this._location = { x: 0, y: 0 };
    this._angle = 0;
    this._size = 1;
    this._color = "black";

    this._ctx = canvas.getContext("2d");
  }

  up() {
    this._drawing = false;

    return this;
  }

  down() {
    this._drawing = true;

    return this;
  }

  goto(x, y) {
    
    if (this._drawing) {
      this._ctx.lineWidth = this._size === 0 ? 0.000000001 : this._size;
      this._ctx.strokeStyle = this._color;
      this._ctx.fillStyle = this._color;
      
      this._ctx.beginPath();
      this._ctx.moveTo(this._location.x, this._location.y)
      this._ctx.lineTo(x, y);
      this._ctx.stroke();

      this._ctx.beginPath();
      this._ctx.arc(this._location.x, this._location.y, this._size/2, 0, Math.PI * 2, true);
      this._ctx.fill();
      
      this._ctx.beginPath();
      this._ctx.arc(x, y, this._size/2, 0, Math.PI * 2, true);
      this._ctx.fill();
    }

    this._location = { x, y };
    
    return this;
  }

  forward(distance) {
    const last = this._location;
    const a = this._angle/180 * Math.PI;
    const x = last.x + distance * Math.cos(a);
    const y = last.y + distance * Math.sin(a);

    this.goto(x, y);

    return this;
  }

  arc(angle, radius) {
    
    return this;
  }

  setAngle(theta) {
    this._angle = angle;

    return this;
  }

  right(theta) {
    this._angle += theta;

    return this;
  }

  left(theta) {
    this._angle -= theta;

    return this;
  }

  setSize(size) {
    this._size = size >= 0 ? size : 0;

    return this;
  }

  setColor(newColor) {
    this._color = newColor;
    
    return this;
  }

  
}

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
ctx.translate(0.5, 0.5);

function setCanvasSize(width, height) {
  canvas.width = width;
  canvas.height = height;
}

function createTurtle(x, y) {
  const t = new Turtle(canvas);
  t.up().goto(x, y).down();

  return t;
}

function fillScreen(color) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// whole template is run on initialization
// when code is sent this function is run
export default function(program) {
  const func = new Function("setCanvasSize", "fillScreen", "createTurtle", program);
  func(setCanvasSize, fillScreen, createTurtle);
}

/*

const w = 509;
const h = 579;

setCanvasSize(w, h);
fillScreen("white");

const t = createTurtle(w/2, h/2);

t.setSize(3);

for (let i = 0; i < 430; i += 1) {
  t.setColor(`hsl(${0.5*i}, ${101}%, ${59}%)`)
  t.forward(i);
  t.right(87);
}

*/
