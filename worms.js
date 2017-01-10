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
const STEP_INTERVAL = 	       10;     // milliseconds beween game steps
const DRAW_INTERVAL = 	      100;     // milliseconds between screen refresh 
const TURN_SPEED    = 	        0.05;
const WORM_SPEED    = 	        1.5;     // pixels per step
const DEFAULT_WORM_SIZE =      10;     // head radius
const WORM_LENGTH   = 	       25;     // starting segments -> refactor to use ratios
const LEFT_BORDER   = 	        0;
const RIGHT_BORDER  = 	      800; 	   // field width
const TOP_BORDER    = 	      600; 	   // field height
const BOTTOM_BORDER =           0;  
const CIRCLE_STROKE_STYLE =  '#009900';
const WORM_STARTPOS_X =       200;
const WORM_STARTPOS_Y =       200;
const BACKGROUND_IMAGE =     'grey-background.png';
const WORM_COLOR_HEAD =      'yellow';
const WORM_COLOR_BODY =      'green';         // XXX
const WORM_COLOR_HUMAN =     'red';
const WORM_COLOR_NONHUMAN =  WORM_COLOR_BODY; // XXX

// magic numbers
//
//    bitmap numbers for direction numbers (4bits), game state (2bits), etc.
const KEY_DOWN_NOTHING =     0x00;
const KEY_DOWN_LEFT =  	     0x01;
const KEY_DOWN_RIGHT = 	     0x02;
const KEY_DOWN_UPDATE =      0x04;
const GAME_MENU =            0x10; // b0001,0000
const GAME_RUNNING =         0x20; // b0010,0000
const GAME_PAUSED =          0x30; // b0011,0000

const WORM_MOVING_STRAIGHT = 1;
const WORM_TURNING_LEFT =    2;
const WORM_TURNING_RIGHT =   3;

const KEYCODE_LEFT =        37;
const KEYCODE_RIGHT =       38;
const KEYCODE_UP =          39;
const KEYCODE_DOWN =        40;
const KEYCODE_SPACE =       32;
const KEYCODE_ENTER =       13;

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
    if(radians => Math.PI) {
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
    return new Position( vect1.getX()+vect2.getX(), vect1.getY()+vect2.getY());
}

function multVector(num, vect){
    return new Position( vect.getX()*num, vect.getY()*num);
}

// for efficiency one larger function may be faster.
function getNewLoc(angle, speed, start){
    //console.log("getNewLoc: a/s/p: "+angle+"/"+speed+"/"+start._x+":"+start._y);
    return addVectors( start, (multVector( speed, getVector( angle))));
}

function getArrowKeyDirection (keyCode) {
    console.log( "getArrowKeyDirection - keyCode => ["+ keyCode +"]" );
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

// ------ Class definitions -------------------

// -------- Position --------------
function Position(x,y){
    this._x = x;
    this._y = y;
}

Position.prototype.debugPosition = function (){
    console.log("Position: "+this._x+":"+this._y);
};

Position.prototype.getX = function (){
    return this._x;
};

Position.prototype.getY = function (){
    return this._y;
};

// ------- Circle ------------------
function Circle(radius, color, x, y){
    this._radius = radius;
    this._color = color;
    this._position = new Position(x,y);
}

Circle.prototype.getPosition = function (){
    return this._position;
};

Circle.prototype.move = function (newPosition){
    this._position = newPosition;
};

Circle.prototype.drawMe = function (context){
    //console.log(this._position.getX(), this._position.getY());
    context.beginPath();
    context.fillStyle =   this._color;
    context.lineWidth =   1;
    context.strokeStyle = CIRCLE_STROKE_STYLE;
    context.arc( this._position.getX(), this._position.getY(), this._radius, 0, 2 * Math.PI, false);
    context.fill();
    context.stroke();
};

// ------------- Worm  ------------------

function Worm( color){
    if ( ! color )
	color = WORM_COLOR_BODY;
    this._state =     WORM_MOVING_STRAIGHT;
    this._speed =     WORM_SPEED;
    this._angle =     getRadians( new Position( 3*Math.random(), 4*Math.random()));
    this._score =     0;
    this._length =    WORM_LENGTH;
    this._head =      new Circle( DEFAULT_WORM_SIZE, WORM_COLOR_HEAD, WORM_STARTPOS_X, WORM_STARTPOS_Y);
    this._bodyList =  new Array();
    this._bodyList.push( this._head);
    for (let j = 1; j < this._length; j++){
	let bodyLoc = getNewLoc( reverseAngle(this._angle), WORM_SPEED * j, this._head._position);
	//  console.log("Position "+ j +" = "+ bodyLoc.getX() +"/"+ bodyLoc.getY());
	let segment = new Circle( DEFAULT_WORM_SIZE, color, bodyLoc.getX(), bodyLoc.getY());
	this._bodyList.push( segment);
    }
};

Worm.prototype.getHead = function (){
    return this._head;
};

Worm.prototype.getHeadPosition = function (){
    return this._head._position;
};

Worm.prototype.stopTurning = function (){
    console.log( "Worm.stopTurning");
    this._state = WORM_MOVING_STRAIGHT;
};

Worm.prototype.turnLeft = function (){
    console.log( "Worm.stopLeft");
    this._state = WORM_TURN_LEFT;
};

Worm.prototype.turnRight = function (){
    console.log( "Worm.stopRight");
    this._state = WORM_TURN_RIGHT;
};

// Maybe combine move/draw to reduce loops, if they loop in same direction....
Worm.prototype.move = function (){
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

Worm.prototype.drawMe = function (context){
    for(i = (this._bodyList.length -1); i >= 0; i--){
	//console.log("i = "+i+": "+this._bodyList[i].getPosition().getX()+
	//" / "+this._bodyList[i].getPosition().getY() );
	this._bodyList[i].drawMe(context);
    }
};

Worm.prototype.checkBorderCollision = function (){
    if(this._head._position.getX() + this._head._radius >= RIGHT_BORDER  ||
       this._head._position.getX() - this._head._radius <= BOTTOM_BORDER ||
       this._head._position.getY() + this._head._radius >= TOP_BORDER    ||
       this._head._position.getY() - this._head._radius <= LEFT_BORDER){
	this._angle = compAngle(this._angle);
    }
};

Worm.prototype.debugWorm = function (){
    console.log("--Worm speed: "+ this._speed);
    console.log("--Worm position: "+ this.getHeadPosition().getX() +":"+ this.getHeadPosition().getY());
    console.log("--Worm angle: "+ this._angle);
    var loctn = new Position( getVector(this._angle));
    console.log("--Worm vector: "+ loctn.getX() +":"+ loctn.getY());
}

// -------------- The main scope "WormGame" ------------------

// Top-level object for game
function WormGame( canvas, count_humans, count_total){
    this._state =   GAME_PAUSED;
    this._canvas  = canvas;
    this._context = canvas.getContext('2d');
    this._bgImage = new Image();
    this._bgImage.onLoad = function () {};
    this._bgImage.src = BACKGROUND_IMAGE;
    this._pattern = this._context.createPattern( this._bgImage, "repeat");
    this._context.fileStyle = this._pattern;
    this._context.fill();
    // keeping single worm constant around for future network-play
    //this._worm = new Worm;

    // temporarily making multi-player version in one browser.
    this._worms = new Array();
    this._worms.push( new Worm( WORM_COLOR_HUMAN));
    this._worms.push( new Worm());
    this._worms.push( new Worm());
    this._worms.push( new Worm());

    let stepTimeCounter = 0;
    //let refreshTimeCounter = 0;
    let previousTime;
    this._gameLoop = (newTime) => {
	if(previousTime){
	    stepTimeCounter += (newTime - previousTime);
	    while(stepTimeCounter > STEP_INTERVAL){
		this.update();
		stepTimeCounter -= STEP_INTERVAL;
	    }
	    this.refreshScreen();
	}
	previousTime = newTime;
	requestAnimationFrame( this._gameLoop);
    };
}

WormGame.prototype.start = function() {
    this._gameLoop();
}

WormGame.prototype.update = function (){
    for (let it = 0; it < this._worms.length; it++) {
	this._worms[it].move();
    }
    //this._worm.move();
};

WormGame.prototype.refreshScreen = function (){
    //this._context.fillStyle = '#000';
    this._context.fillStyle = this._pattern;
    this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
    for(let k = 0; k < this._worms.length; k++) {
	this._worms[k].drawMe(this._context);
    }
}

Worm.prototype.getHead = function (){
    return this._head;
};

// ------------- Squirm  ------------------
function SQUIRM(){
    this._state =     GAME_PAUSED;
    this._canvas = document.getElementById('worms');
    // event listeners
    this._handlers_keydown = {
	"up" : 	    function (e,w) { console.log("Accelerate"); },
	"left" :    function (e,w) { w.turnLeft(); },
	"right" :   function (e,w) { w.turnRight(); }
    };
    this._handlers_keyup = {
	"up" :      function (e,w) { console.log("Accelerate STOP"); },
	"left" :    function (e,w) { w.turnLeftOff(); },
	"right" :   function (e,w) { w.turnRightOff(); }
    };
    this._handlers_keypress = {
	"space" :   function (e,w) { console.log("PAUSE/RESUME"); }
    };
    document.addEventListener( 'keydown', function(event) {
	console.log( "keydown-listener");
	var direction;
	if (isArrowKey(event.keyCode)) {
	    direction = getArrowKeyDirection(event.keyCode);
	}
	if ( !!direction ) {
	    let cb = handlers_keydown[ direction ];
	    if ( !!cb ) {
		cb( event, Worms._worms[0]);
	    }
	}
    });
    document.addEventListener('keyup', function(event) {
	console.log( "keyup-listener");
	
	var direction;
	if (isArrowKey(event.keyCode)) {
	    direction = getArrowKeyDirection(event.keyCode);
	}
	if ( !!direction ) {
	    let cb = handlers_keyup[ direction ];
	    if ( !!cb ) {
		cb( event, Worms._worms[0]);
	    }
	}
    });
    this._game = new WormGame( this._canvas );
};

SQUIRM.prototype.start = function() {
    this._game.start();
}

// ------------ static initializers ------------

// Instantiate the game
squirm = new SQUIRM();
squirm.start();
