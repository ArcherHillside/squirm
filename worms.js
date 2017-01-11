//  TODO:  -> Not in order..
//  Snake growing
//  Background patern
//  Things to eat
//  Keep snake in center of screen and scroll background
//  Scale snakes perspective to correlate with size
//  Snakes eating each other
//  Network sockets and a server
//  Better graphics
//  Score keeping and display
//  keep top 10 scores
//  Make arrow keydown events take effect sooner
//  DONE - Add game start
//  DONE - Add acceleration
//  DONE - Multiple players
//  DONE - Add pause


// --------- CONSTANTS-------------
const STEP_INTERVAL = 	       10;     // milliseconds beween game steps
const DRAW_INTERVAL = 	      100;     // milliseconds between screen refresh 
const TURN_SPEED    = 	        0.05;
const WORM_SPEED    = 	        1.5;     // pixels per step
const BOOST_FACTOR    =         2.0;
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

// NOTE - application state numbers
const SQUIRM_MENU =          1;
const SQUIRM_WORMGAME =      2;
const WORMGAME_MENU =        0x10; // b0001,0000
const WORMGAME_RUNNING =     0x20; // b0010,0000
const WORMGAME_PAUSED =      0x30; // b0011,0000

const WORM_MASK_MOVE =       ~0x03; // 3bits, b00000xxx
const WORM_MASK_BOOST =      ~0x40; // 1bit,  b0000x000
const WORM_MOVING_STRAIGHT =  0x01; // 3bits, b00000xxx
const WORM_TURNING_LEFT =     0x02; // 3bits, b00000xxx
const WORM_TURNING_RIGHT =    0x03; // 3bits, b00000xxx
const WORM_BOOSTED =          0x40; // 1bit,  b0000x000

// DOM KeyboardEvent.keyCode
const KEYCODE_LEFT =        37; // left arrow
const KEYCODE_RIGHT =       38; // right arrow
const KEYCODE_UP =          39; // up arrow
const KEYCODE_DOWN =        40; // down arrow
const KEYCODE_SPACE =       32;
const KEYCODE_ENTER =       13;
const KEYCODE_ESC =         27;

// XXX - DOM KeyboardEvent.key, experimental.  Based on deprecation of 'keyCode',
// etc.  See https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
const KEY_LEFT =        'ArrowLeft'; // left arrow
const KEY_RIGHT =       'ArrowRight'; // right arrow
const KEY_UP =          'ArrowUp'; // up arrow
const KEY_DOWN =        'ArrowDown'; // down arrow
const KEY_SPACE =       ' ';
const KEY_ENTER =       'Enter';
const KEY_ESCAPE =      'Escape';
const KEY_BACKSPACE =   'Backspace';
const KEY_TAB =       	'Tab';
const KEY_META =        'Meta';
const KEY_ALT =       	'Alt';
const KEY_CONTROL =   	'Control';
const KEY_SHIFT =   	'Shift';
const KEYS_SPECIAL =    [ KEY_LEFT, KEY_RIGHT, KEY_UP, KEY_DOWN, KEY_SPACE, KEY_ENTER,
			  KEY_ESCAPE, KEY_BACKSPACE, KEY_TAB, KEY_META, KEY_ALT, KEY_CONTROL,
			  KEY_TAB, KEY_SHIFT ];
const KEYS_ALPHABET =   'abcdefghijklmnopqrstuvwxyz';
const KEYS_NUMERALS =   '0123456789';
const KEYS_SYMBOLS =    '`,./;\'[]\\-=~!@#$%^&*()_+{}|:"<>?';

// -------------  Utilities --------------------
function reverse(num){
    return num * (-1);
}

function getRadians(vector){
    return Math.atan2( vector.getX(), vector.getY());
}

function getVector(radians){
    return new Position( Math.cos(radians), Math.sin(radians));
}

function reverseAngle(radians){
    if(radians >= Math.PI) {
	return radians - Math.PI;
    } else {
	return radians + Math.PI;
    }
}

//  function compAngle(radians){
//      return 2 * Math.PI - radians;
//      if(radians >= Math.PI){
//  	return radians - (Math.PI/4);
//      } else {
//  	return radians + (Math.PI/4);
//      }
//  }

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

//  function getArrowKeyDirection( keyCode) {
//      console.log( "getArrowKeyDirection - keyCode => ["+ keyCode +"]" );
//      return {
//  	37: 'left',
//  	39: 'right',
//  	38: 'up',
//  	40: 'down'
//      }[keyCode];
//  }
//  
//  function isArrowKey( keyCode) {
//      return !!getArrowKeyDirection(keyCode);
//  }

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
    //  this._angle =     getRadians( new Position( 3*Math.random(), 4*Math.random()));
    this._angle =     Math.PI - (2 * Math.PI * Math.random());
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
     console.log( "Worm.stopTurning - state => ["+ this._state +"]");
    this._state &= WORM_MASK_MOVE;
    this._state |= WORM_MOVING_STRAIGHT;
};

Worm.prototype.turnLeft = function (){
    console.log( "Worm.stopLeft - state => ["+ this._state +"]");
    this._state &= WORM_MASK_MOVE;
    this._state |= WORM_TURNING_LEFT;
};

Worm.prototype.turnRight = function (){
    console.log( "Worm.stopRight - state => ["+ this._state +"]");
    this._state &= WORM_MASK_MOVE;
    this._state |= WORM_TURNING_RIGHT;
};

Worm.prototype.boostOn = function (){
    console.log( "Worm.boostOn - state => ["+ this._state +"]");
    this._state |= WORM_BOOSTED;
};

Worm.prototype.boostOff = function (){
    console.log( "Worm.boostOff - state => ["+ this._state +"]");
    this._state &= WORM_MASK_BOOST;
};

// Maybe combine move/draw to reduce loops, if they loop in same direction....
Worm.prototype.move = function (){
    // XXX - is this right?  or can the worm turn faster than it can move?
    let state = this._state & ~WORM_MASK_MOVE;
    if (WORM_TURNING_RIGHT === state) {
	this._angle += TURN_SPEED; // NOTE - turn right
    } else if (WORM_TURNING_LEFT === state) {
	this._angle -= TURN_SPEED; // NOTE - turn left
    } else if (WORM_MOVING_STRAIGHT !== state) {
      	console.error( "Worm.move - invalid Worm state ["+ state +"]");
    }
    //--------------------------------------------------------------------------------
    //  let newLocation = getNewLoc( this._angle, this._speed, this._bodyList[0].getPosition());
    let speed = this._speed;
    if (this._state & WORM_BOOSTED)
	speed *= BOOST_FACTOR;
    let newLocation = getNewLoc( this._angle, speed, this._bodyList[0].getPosition());
    let nextLocation;
    for (let i = 0; i < this._bodyList.length; i++){
	//  nextLocation = this._bodyList[i].getPosition();
	//  this._bodyList[i].move( newLocation);
	let body = this._bodyList[i];
	nextLocation = body.getPosition();
	body.move( newLocation);
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
    //  if (((this._head._position.getX() + this._head._radius) >= RIGHT_BORDER)  ||
    //      ((this._head._position.getX() - this._head._radius) <= BOTTOM_BORDER) ||
    //      ((this._head._position.getY() + this._head._radius) >= TOP_BORDER)    ||
    //  	((this._head._position.getY() - this._head._radius) <= LEFT_BORDER)) {
    //  	this._angle = compAngle( this._angle);

    //  console.log("Worm.checkBorderCollision - getX => ["+ this._head._position.getX() +"] ["+ LEFT_BORDER +"] ["+ RIGHT_BORDER +"]; getY => ["+ this._head._position.getY() +"] ["+ BOTTOM_BORDER +"] ["+ TOP_BORDER +"]");
    var collision = false;
    if ((this._head._position.getX() + this._head._radius) >= RIGHT_BORDER) {
	//  console.warn("Worm.checkBorderCollision - collision on RIGHT; this._angle => ["+ this._angle +"]");
    	this._angle = Math.PI - this._angle;
    } else if ((this._head._position.getX() - this._head._radius) <= LEFT_BORDER) {
	//  console.warn("Worm.checkBorderCollision - collision on LEFT; this._angle => ["+ this._angle +"]");
	this._angle = Math.PI - this._angle;
    } else if ((this._head._position.getY() + this._head._radius) >= TOP_BORDER) {
	//  console.warn("Worm.checkBorderCollision - collision on TOP; this._angle => ["+ this._angle +"]");
    	this._angle = 2 * Math.PI - this._angle;
    } else if ((this._head._position.getY() - this._head._radius) <= BOTTOM_BORDER) {
	//  console.warn("Worm.checkBorderCollision - collision on BOTTOM; this._angle => ["+ this._angle +"]");
    	this._angle = 2 * Math.PI - this._angle;
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
function WormGame( count_human, count_machine){
    var self = this;
    this._state =  WORMGAME_PAUSED;
    this._canvas = document.getElementById('worms');
    this._context = this._canvas.getContext('2d');
    this._bgImage = new Image();
    this._bgImage.onLoad = function () {};
    this._bgImage.src = BACKGROUND_IMAGE;
    this._pattern = this._context.createPattern( this._bgImage, "repeat");
    this._context.fillStyle = this._pattern;
    this._context.fill();
    // keeping single worm constant around for future network-play
    //this._worm = new Worm;

    // NOTE - we save these so that they can be deactivated in the (NIY) stop
    // function.  that will allow us to completely deactivate this 'app' when
    // multiple application modes are implemented.
    this._handlers = {'keydown' :  function (e) { self.handle_keydown(e); }, 
		      'keyup' :    function (e) { self.handle_keyup(e); }
		      // NOTE - I was wrong about the KEYPRESS event.  It is NOT
		      // equivalent to KEYDOWN+KEYUP.
		     };
    document.addEventListener( 'keydown',  this._handlers.keydown );
    document.addEventListener( 'keyup',    this._handlers.keyup );


    // XXX - temporarily making multi-player version in one browser.
    this._worms = new Array();
    for (let i=0; i<count_human; ++i)
	this._worms.push( new Worm( WORM_COLOR_HUMAN));
    for (let i=0; i<count_machine; ++i)
	this._worms.push( new Worm());

    // initialize keymap (with state)
    let KEYS = {};
    for (let key of KEYS_ALPHABET)
	KEYS[key] = this.makeKeyEventStruct( key, null, null );
    for (let key of KEYS_ALPHABET.toUpperCase())
	KEYS[key] = this.makeKeyEventStruct( key, null, null );
    for (let key of KEYS_NUMERALS)
	KEYS[key] = this.makeKeyEventStruct( key, null, null );
    for (let key of KEYS_SYMBOLS)
	KEYS[key] = this.makeKeyEventStruct( key, null, null );
    for (let key of KEYS_SPECIAL)
	KEYS[key] = this.makeKeyEventStruct( key, null, null );
    this._keys = KEYS;
    KEYS[ KEY_SPACE ].up = function (e) { self.toggle_pause(); };
    // XXX - per player keymaps need to be refactored again
    { let player_maps = [ { player :   this._worms[0],
			    left :     [KEY_LEFT],   // NOTE - a set
			    right :    [KEY_RIGHT],  // NOTE - a set
			    boost :    [KEY_UP]      // NOTE - a set
			  },
			  { player :   this._worms[1],
			    left :     ["Q", "q"], // NOTE - a set
			    right :    ["W", "w"], // NOTE - a set
			    boost :    ["T", "t"]  // NOTE - a set
			  },
			  { player :   this._worms[0],
			    left :     ["A", "a"],  // NOTE - a set
			    right :    ["D", "d"],  // NOTE - a set
			    boost :    [KEY_ENTER]  // NOTE - a set
			  }
			];
      for (let desc of player_maps) {
	  let pl = desc.player;
	  let map = { 'left' : { 'down' : function (e) { let key = self._keys[ e.key ];
							 key.is_down = true;
							 pl.turnLeft(); },
				 'up' :   function (e) { let key = self._keys[ e.key ];
							 key.is_down = false;
							 let stopTurning = true;
							 for (let k of desc.right) {
							     let key = self._keys[ k ];
							     if (key.is_down) {
								 stopTurning = false;
								 break;
							     }
							 }
							 if (stopTurning)
							     pl.stopTurning();
							 else
							     pl.turnRight();
						       }
			       },
	  	      'right' : { 'down' : function (e) { let key = self._keys[ e.key ];
							  key.is_down = true;
							  pl.turnRight(); },
				  'up' : function (e) { let key = self._keys[ e.key ];
							key.is_down = false;
							let stopTurning = true;
							for (let k of desc.left) {
							    let key = self._keys[ k ];
							    if (key.is_down) {
								stopTurning = false;
								break;
							    }
							}
							if (stopTurning)
							    pl.stopTurning();
							else
							    pl.turnLeft();
						      }
				},
		      'boost' : { 'down' : function (e) { pl.boostOn(); },
	  			  'up' :   function (e) { pl.boostOff(); }
				}
		    };
	  for (let kv1 in map) {
	      for (let kv2 of desc[kv1]) {
		  //  let a = KEYS[kv2];
		  //  let b = map[kv1];
		  for (let x of ['down','up']) {
		      console.info( "kv1 => ["+ kv1 +"]; kv2 => ["+ kv2 +"]; x => ["+ x +"]");
		      if (!!KEYS[kv2][x]) {
			  console.error( "WormGame.WormGame - key ["+ kv2 +"] ["+ x +"] is already registered; aborting");
			  return;
		      } else {
			  KEYS[kv2][x] = map[kv1][x];
			  //  a[x] = b[x];
		      }
		  }
	      }
	  }
      }
    }

    // XXX - this change is a design decision.  the commented loop allows the
    // game to 'catch up' when the clock falls behind.  however, this is not
    // necessarily desirable because the game's state may NOT be determined by
    // the clock but by external entities, e.g., remote players.  The
    // requestAnimationFrame is part of the browser's repaint loop which means
    // that it is not called when the loop pauses which it does, e.g., when the
    // user switches tabs or minimizes the window, etc.  So whether to 'catch
    // up' is still pending a final decision about the project's goal/s.  Since
    // this code is easy enough to switch, we can leave it like this.  OTOH, we
    // could create separate functions and set the desired one during
    // initialization.  meh - that can be done later.  this works for now.
    this._gameLoop = (newTime) => {
	if (WORMGAME_RUNNING !== this._state)
	    console.error( "WormGame._gameLoop - called in invalid state ["+ this._state +"]; aborting");
	else {
	    this.update();
	    this.refreshScreen();
	    requestAnimationFrame( this._gameLoop);
	}
    };
    //  let stepTimeCounter = 0;
    //  //  let refreshTimeCounter = 0;
    //  let previousTime;
    //  this._gameLoop = (newTime) => {
    //  	if (WORMGAME_RUNNING !== this._state)
    //  	    console.error( "WormGame._gameLoop - called in invalid state ["+ this._state +"]; aborting");
    //  	else {
    //  	    if (previousTime) {
    //  	    	stepTimeCounter += (newTime - previousTime);
    //  	    	while(stepTimeCounter > STEP_INTERVAL){
    //  	    	    this.update();
    //  	    	    stepTimeCounter -= STEP_INTERVAL;
    //  	    	}
    //  	    	this.refreshScreen();
    //  	    }
    //  	    previousTime = newTime;
    //  	    requestAnimationFrame( this._gameLoop);
    //  	}
    //  };
};

WormGame.prototype.makeKeyEventStruct = function ( k, cb_keyup, cb_keydown) {
    return { key :      k,           // const
	     up :   	cb_keyup,    // const
	     down : 	cb_keydown,  // const
	     is_down :  false // state flag, boolean
	   };
};

WormGame.prototype.start = function() {
    console.log( "WormGame.start" );
    // XXX - start the menu?  start the game?  for now, just press SPACE when you
    // get a blank page.
    // 
    //  this._gameLoop();
};

WormGame.prototype.handle_keydown = function(e) {
    console.log( "WormGame.handle_keydown - e.key => ["+ e.key +"]; e.keyCode => ["+ e.keyCode +"]" );
    let key = this._keys[ e.key ];
    key.is_down = true;
    let cb = key.down;
    if (!!cb)
	cb( e);
    else
	console.info( "WormGame.handle_keydown - no handler registered for key => ["+ e.key +"]" );
};

WormGame.prototype.handle_keyup = function(e) {
    console.log( "WormGame.handle_keyup - e.key => ["+ e.key +"]; e.keyCode => ["+ e.keyCode +"]" );
    let key = this._keys[ e.key ];
    key.is_down = false;
    let cb = key.up;
    if (!!cb)
	cb( e);
    else
	console.info( "WormGame.handle_keyup - no handler registered for key => ["+ e.key +"]" );
    
    //  if (KEYCODE_SPACE === e.keyCode) {
    //  	console.log( "WormGame.handle_keyup - SPACE" );
    //  	if (WORMGAME_RUNNING === this._state)
    //  	    this._state = WORMGAME_PAUSED;
    //  	else if (WORMGAME_PAUSED === this._state) {
    //  	    this._state = WORMGAME_RUNNING;
    //  	    requestAnimationFrame( this._gameLoop);
    //  	} else
    //  	    console.error( "WormGame.handle_keyup - invalid game state ["+ this._state +"]");
    //  }
};

WormGame.prototype.toggle_pause = function(e) {
    console.log( "WormGame.toggle_pause - state => ["+ this._state +"]" );
    switch (this._state) {
    case WORMGAME_RUNNING:
	this._state = WORMGAME_PAUSED;
	break;
    case WORMGAME_PAUSED:
	this._state = WORMGAME_RUNNING;
	requestAnimationFrame( this._gameLoop);
	break;
    default:
	console.error( "WormGame.toggle_pause - invalid game state ["+ this._state +"]");
    }
};

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
};

Worm.prototype.getHead = function (){
    return this._head;
};

// ------------- Squirm  ------------------
function SQUIRM(){
    this._state = SQUIRM_WORMGAME;     // XXX; to accomodate multiple modes in the near future
    this._game = null;                 // XXX; to accomodate multiple modes in the near future
};

SQUIRM.prototype.start = function() {
    console.log( "SQUIRM.start" );
    if (null !== this._game)
	console.error( "SQUIRM.start - invalid value ["+ this._game +"] for this._game, should be NULL; aborting");
    else if (SQUIRM_WORMGAME === this._state) {
	this._game = new WormGame( 2, 10 ); // XXX - hard-coded values
	this._game.start();
    } else {
	console.error( "SQUIRM.start - invalid value for this._state ["+ this._state +"]; aborting");
    }
}

// ------------ static initializers ------------

// Instantiate the game
squirm = new SQUIRM();
squirm.start();
