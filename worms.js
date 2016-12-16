// --------- CONSTANTS-------------
var DEFAULT_WORM_SIZE = 20;
var WORM_SPEED    = 5;
var GAME_SPEED    = 400;
var LEFT_BORDER   = 0;
var RIGHT_BORDER  = 800; // field width
var TOP_BORDER    = 600; // field height
var BOTTOM_BORDER = 0;

// ---------------------------------
function reverse(num){
  return num * (-1);
}

function getRadians(vector){
  return Math.atan2(vector.x, vector.y);
}

function getVector(radians){
  return new Vector(Math.cos(radians), Math.sin(radians));
}

function reverseAngle(radians){
  if(radians => Math.PI){
     return radians - Math.PI;
   } else {
     return radians + Math.PI;
   }
}

function compAngle(radians){
  if(radians => Math.PI){
     return radians - (Math.PI/4);
   } else {
     return radians + (Math.PI/4);
   }
}

function addVectors(vect1, vect2){
  return new Vector(vect1.x+vect2.x, vect1.y+vect2.y);
}

function multVector(num, vect){
  return new Vector(vect.x*num, vect.y*num);
}

function getNewLoc(angle, speed, start){
  return addVectors(start, (multVector(speed,getVector(angle))));
}

// ---------  Classes --------------
class Vector{
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}

class Circle {
  constructor(radius=DEFAULT_WORM_SIZE, color='green', x = 200, y = 200){
    this.radius = radius;
    this.color = color;
    this.coord = new Vector(x,y);
    this.move = function(newVector){
       this.coord = newVector;
    }

    this.drawMe = function(context){
      context.beginPath();
      context.fillStyle = this.color;
      context.arc(this.coord.x, this.coord.y, this.radius, 0,2 * Math.PI,false);
      context.fill();
      context.lineWidth = 5;
      context.stroke();
    }
  }
}

class Worm {
  constructor(){
    this.head = new Circle(DEFAULT_WORM_SIZE, 'yellow');
    this.speed = WORM_SPEED;
    this.angle = getRadians(new Vector(Math.random(),Math.random()));
    this.length = 6;
    this.body = new Circle(DEFAULT_WORM_SIZE,'green',(this.head.coord.x) -15,(this.head.coord.y) -15);
    this.grow = function(addition){
      this.length += addition;
    }
    this.move = function(){
      this.prevLoc = this.head.coord;
      this.head.move(getNewLoc(this.angle, this.speed, this.head.coord));
      this.body.move(this.prevLoc);
    }
    this.drawMe = function(context){
      this.body.drawMe(context);
      this.head.drawMe(context);
    }
  }
}

// ---------------- Begin Canvas Manipulation ------------------
const canvas = document.getElementById('worms');
const context = canvas.getContext('2d');

context.fillStyle = '#000';
context.fillRect(0, 0, canvas.width, canvas.height);

const worm = new Worm;
console.log(worm.head);


function checkBorderCollision(worm){
    if(worm.head.coord.x >= RIGHT_BORDER ||
       worm.head.coord.x <= BOTTOM_BORDER ||
       worm.head.coord.y >= TOP_BORDER ||
       worm.head.coord.y <= LEFT_BORDER){
    worm.angle = compAngle(worm.angle);
  }

}

let previousTime;

function gameLoop(newTime){
  if(previousTime) {
    update(newTime - previousTime);
  }
  previousTime = newTime;
  requestAnimationFrame(gameLoop);
}

function update(time){
  worm.move();
  context.fillStyle = '#000';
  context.fillRect(0, 0, canvas.width, canvas.height);
  worm.drawMe(context);
  //console.log("Speed: "+worm.speed+ ", Angle: "+worm.angle+",  Location: "+worm.head.coord.x +":"+worm.head.coord.y);
  checkBorderCollision(worm);
}

gameLoop();

