//  TODO:  -> Not in order..
//  Snake growing
//  Background patern
//  Things to eat
//  Make arrow keydown events take effect sooner
//  Keep snake in center of screen and scroll background
//  Scale snakes perspective to correlate with size
//  Multiple players
//  Snakes eating each other
//  Network sockets and a server
//  Better graphics
//  Add acceleration
//  Score keeping and display
//  keep top 10 scores
//  Add game start and pause


// --------- CONSTANTS-------------
const STEP_INTERVAL = 10;   // milliseconds beween game steps
const DRAW_INTERVAL = 100;  // milliseconds between screen refresh 
const TURN_SPEED    = .05;
const WORM_SPEED    = 3;     // pixels per step
const DEFAULT_WORM_SIZE = 10;// head radius
const WORM_LENGTH   = 25;    // starting segments -> refactor to use ratios
const LEFT_BORDER   = 0;
const RIGHT_BORDER  = 800; // field width
const TOP_BORDER    = 600; // field height
const BOTTOM_BORDER = 0;

// magic numbers
//
//    bitmap numbers for direction numbers, 2bits
const KEY_DOWN_NOTHING =   0x0;
const KEY_DOWN_LEFT =  	   0x1;
const KEY_DOWN_RIGHT = 	   0x2;
const KEY_DOWN_UPDATE =    0x4;

// -------------  Utilities --------------------
function reverse(num){
  return num * (-1);
}

function getRadians(vector){
  return Math.atan2(vector.getX(), vector.getY());
}

function getVector(radians){
  return new Position(Math.cos(radians), Math.sin(radians));
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
  return new Position(vect1.getX()+vect2.getX(), vect1.getY()+vect2.getY());
}

function multVector(num, vect){
  return new Position(vect.getX()*num, vect.getY()*num);
}

// for efficiency one larger function may be faster.
function getNewLoc(angle, speed, start){
  //console.log("getNewLoc: a/s/p: "+angle+"/"+speed+"/"+start._x+":"+start._y);
  return addVectors(start, (multVector(speed,getVector(angle))));
}

function getArrowKeyDirection (keyCode) {
  return {
    37: 'left',
    39: 'right',
    38: 'up',
    40: 'down'
  }[keyCode];
}

function isArrowKey (keyCode) {
  return !!getArrowKeyDirection(keyCode);
}

// ------ Class objects -------------------

// -------- Position --------------
function Position(x,y){
  this._x = x;
  this._y = y;
}

Position.prototype.debugPosition = function fpd(){
   console.log("Position: "+this._x+":"+this._y);
};

Position.prototype.getX = function fpgx(){
   return this._x;
};

Position.prototype.getY = function fpgy(){
   return this._y;
};


// ------- Circle ------------------
function Circle(radius, color, x, y){
    this._radius = radius;
    this._color = color;
    this._position = new Position(x,y);
}

Circle.prototype.getPosition = function cgp(){
   return this._position;
};

Circle.prototype.move = function cmv(newPosition){
  this._position = newPosition;
};

Circle.prototype.drawMe = function cdm(context){
  //console.log(this._position.getX(), this._position.getY());
  context.beginPath();
  context.fillStyle = this._color;
  context.arc(this._position.getX(), this._position.getY(), this._radius, 0, 2 * Math.PI, false);
  context.fill();
  context.lineWidth = 1;
  context.strokeStyle = '#009900'
  context.stroke();
};


// ------------- Worm  ------------------
function Worm(color){
  if ( ! color )
      color = 'green';
  this._keystate = KEY_DOWN_NOTHING;
  this._head = new Circle(DEFAULT_WORM_SIZE, 'yellow', 200, 200);
  this._speed = WORM_SPEED;
  this._angle = getRadians(new Position(Math.random()*3,Math.random()*4));
  this._score = 0;
  this._length = WORM_LENGTH;
  this._bodyList = new Array();
  this._bodyList.push(this._head);
  for(j = 1; j < this._length; j++){
    let bodyLoc = getNewLoc(reverseAngle(this._angle), WORM_SPEED * j, this._head._position);
    //console.log("Position "+j+" = "+bodyLoc.getX()+"/"+bodyLoc.getY());
    let segment = new Circle(DEFAULT_WORM_SIZE,color,bodyLoc.getX(),bodyLoc.getY());
    this._bodyList.push(segment);
  }
};

Worm.prototype.getHead = function wgh(){
  return this._head;
};

Worm.prototype.getHeadPosition = function wghp(){
  return this._head._position;
};

Worm.prototype.turnRight = function tr(){
  //  this._angle += TURN_SPEED;
  //
  // add condition to check for RIGHT keydown  
  this._keystate &= ~KEY_DOWN_LEFT; // XXX - force the LEFT key off
  this._keystate |= KEY_DOWN_RIGHT;
  console.log( "turnRight => ["+ this._keystate +"]");
};

Worm.prototype.turnLeft = function tl(){
  //  this._angle -= TURN_SPEED;
  //
  // add condition to check for RIGHT keydown  
  this._keystate &= ~KEY_DOWN_RIGHT; // XXX - force the LEFT key off
  this._keystate |= KEY_DOWN_LEFT;
  console.log( "turnLeft => ["+ this._keystate +"]");
};

Worm.prototype.turnRightOff = function tr(){
  this._keystate &= ~KEY_DOWN_RIGHT;
  console.log( "turnRight-OFF => ["+ this._keystate +"]");
};

Worm.prototype.turnLeftOff = function tl(){
  this._keystate &= ~KEY_DOWN_LEFT;
  console.log( "turnLeft-OFF => ["+ this._keystate +"]");
};

// Maybe combine move/draw to reduce loops, if they loop in same direction....
Worm.prototype.move = function wmv(){
  // XXX - is this right?  or can the worm turn faster than it can move?
  if (this._keystate & KEY_DOWN_RIGHT) {
    this._angle += TURN_SPEED; // NOTE - turn right
  } else if (this._keystate & KEY_DOWN_LEFT) {
    this._angle -= TURN_SPEED; // NOTE - turn left
  }
  //--------------------------------------------------------------------------------
  let newLocation = getNewLoc(this._angle, this._speed, this._bodyList[0].getPosition());
  let nextLocation;
  for(i = 0; i < this._bodyList.length; i++){
    nextLocation = this._bodyList[i].getPosition();
    this._bodyList[i].move(newLocation);
    newLocation = nextLocation;
    //console.log("i = "+i+": "+this._bodyList[i].getPosition().getX()+
      //" / "+this._bodyList[i].getPosition().getY() );
  }
  this._head = this._bodyList[0];
  this.checkBorderCollision();
};

Worm.prototype.drawMe = function wdm(context){
  for(i = (this._bodyList.length -1); i >= 0; i--){
     //console.log("i = "+i+": "+this._bodyList[i].getPosition().getX()+
      //" / "+this._bodyList[i].getPosition().getY() );
     this._bodyList[i].drawMe(context);
  }
};

Worm.prototype.checkBorderCollision = function wcb(){
    if(this._head._position.getX() + this._head._radius >= RIGHT_BORDER  ||
       this._head._position.getX() - this._head._radius <= BOTTOM_BORDER ||
       this._head._position.getY() + this._head._radius >= TOP_BORDER    ||
       this._head._position.getY() - this._head._radius <= LEFT_BORDER){
       this._angle = compAngle(this._angle);
    }
};

Worm.prototype.debugWorm = function wdw(){
  console.log("--Worm speed: "+this._speed);
  console.log("--Worm position: "+this.getHeadPosition().getX()+":"+this.getHeadPosition().getY());
  console.log("--Worm angle: "+this._angle);
  var loctn = new Position(getVector(this._angle));
  console.log("--Worm vector: "+loctn.getX()+":"+loctn.getY());
}

// -------------- The main scope "WormGame" ------------------

// Top-level object for game
function WormGame(canvas){
  this._canvas  = canvas;
  this._context = canvas.getContext('2d');
  this._bgImage = new Image();
  this._bgImage.onLoad = function(){  };
  this._bgImage.src = 'grey-background.png';
  this._pattern = this._context.createPattern( this._bgImage, "repeat");
  this._context.fileStyle = this._pattern;
  this._context.fill();
  // keeping single worm constant around for future network-play
  //this._worm = new Worm;

  // temporarily making multi-player version in one browser.
  this._players = new Array();
  this._players.push(new Worm('red'));
  this._players.push(new Worm());
  this._players.push(new Worm());
  this._players.push(new Worm());

  let stepTimeCounter = 0;
  //let refreshTimeCounter = 0;
  let previousTime;
  const gameLoop = (newTime) => {
    if(previousTime){
      stepTimeCounter += (newTime - previousTime);
      while(stepTimeCounter > STEP_INTERVAL){
        this.update();
        stepTimeCounter -= STEP_INTERVAL;
      }
      this.refreshScreen();
    }
    previousTime = newTime;
    requestAnimationFrame(gameLoop);
  };
  gameLoop();
}

WormGame.prototype.update = function update(){
    for(it = 0; it < this._players.length; it++){
       this._players[it].move();
    }
    //this._worm.move();
};

WormGame.prototype.refreshScreen = function wrs(){
  //this._context.fillStyle = '#000';
  this._context.fillStyle = this._pattern;
  this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
  for(k = 0; k < this._players.length; k++){
     this._players[k].drawMe(this._context);
   }
}


const canvas = document.getElementById('worms');

// event listeners

const handlers_keydown = {
    "up" : 	 function (e,w) { console.log("Accelerate"); },
    "left" : 	 function (e,w) { w.turnLeft(); },
    "right" : 	 function (e,w) { w.turnRight(); },
};

document.addEventListener('keydown', function(event) {
  console.log( "keydown-listener");
 
  var direction;
  if (isArrowKey(event.keyCode)) {
    direction = getArrowKeyDirection(event.keyCode);
  }
  if ( !!direction ) {
      let cb = handlers_keydown[ direction ];
      if ( !!cb ) {
	  cb( event, Worms._players[0]);
      }
  }
  //  if (direction === "up"){
  //    console.log("Accelerate");
  //  }
  //  else if (direction === "left"){
  //    Worms._players[0].turnLeft();
  //  }
  //  else if (direction === "right") {
  //    Worms._players[0].turnRight();
  //  }
});

const handlers_keyup = {
    "up" : 	 function (e,w) { console.log("Accelerate STOP"); },
    "left" : 	 function (e,w) { w.turnLeftOff(); },
    "right" : 	 function (e,w) { w.turnRightOff(); },
};

document.addEventListener('keyup', function(event) {
  console.log( "keyup-listener");
 
  var direction;
  if (isArrowKey(event.keyCode)) {
    direction = getArrowKeyDirection(event.keyCode);
  }
  if ( !!direction ) {
      let cb = handlers_keyup[ direction ];
      if ( !!cb ) {
	  cb( event, Worms._players[0]);
      }
  }
});

// Instantiate the game
const Worms = new WormGame(canvas);
