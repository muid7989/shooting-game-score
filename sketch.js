let time;
let frameCountBuffer = 0;
let fps = 0;

const CANVAS_W = 960;
const CANVAS_H = 1280;

const GRID_SIZE = 64;
const GRID_W = 64;
const GRID_BASE_X = GRID_SIZE*2;
const GRID_BASE_Y = GRID_SIZE*4;

const BUTTON_W = CANVAS_W/4;
const BUTTON_H = BUTTON_W/2;
const BUTTON_Y = CANVAS_H*2/3;
const BUTTON_M = 24;

const START_X = (CANVAS_W-BUTTON_W)/2;
const START_Y = GRID_SIZE*8;
const SHOOT_X = GRID_SIZE*11;
const SHOOT_Y = GRID_SIZE*13;

const PLAYER_H = 32;
const PLAYER_W = PLAYER_H*5;
const PLAYER_ANGLE_MAX = 45;
const PLAYER_X = CANVAS_W/2;
const PLAYER_Y = GRID_SIZE*15;
const ITEM_H = GRID_SIZE*1.5;
const ITEM_W = GRID_SIZE;
const ITEM_BASE_X = GRID_BASE_X+GRID_SIZE*2.4;
const ITEM_BASE_Y = GRID_BASE_Y;
const ITEM_ROW = 8;
const ITEM_NUM = 7;
const ITEM_COLOR = 160;
const BALL_SIZE = 10;
const BALL_SPEED = 20;
const JOYSTICK_X = GRID_SIZE*7.5;
const JOYSTICK_Y = PLAYER_Y+GRID_SIZE*1;
const JOYSTICK_SIZE = GRID_SIZE*3;
const JOYSTICK_RANGE = GRID_SIZE*3;

const NAME_INPUT_X = GRID_SIZE*4;
const NAME_INPUT_Y = GRID_SIZE*6;
const NAME_INPUT_W = GRID_SIZE*3;
const NAME_INPUT_H = GRID_SIZE*1;
const NAME_BUTTON_X = NAME_INPUT_X+NAME_INPUT_W;
const NAME_BUTTON_Y = NAME_INPUT_Y;
const NAME_BUTTON_H = NAME_INPUT_H;
const NAME_BUTTON_W = NAME_BUTTON_H*2;
const NAME_INPUT_TEXT_X = NAME_INPUT_X+GRID_SIZE*2;
const NAME_INPUT_TEXT_Y = NAME_INPUT_Y-GRID_SIZE*1;
const NAME_INPUT_TEXT_SIZE = GRID_SIZE*0.5;
const NAME_INPUT_RECT_X = CANVAS_W/2;
const NAME_INPUT_RECT_W = CANVAS_W-GRID_SIZE*2;
const NAME_INPUT_RECT_Y = GRID_SIZE*6;
const NAME_INPUT_RECT_H = GRID_SIZE*6;

let startButton, shootButton, clearButton;
let nameButton;
let nameInput;
let playerName;
let startFlag = false;
let startTime;
let endTime = 0;
let player;
let items;
let joystick;
let ball;
let ballCount = 0;
const BALL_COUNT_START = 14;
let getCount;
let hiScore;
let nameFlag = false;

let timeCount;
const TEXT_VIEW_SIZE = 32;

const DEBUG = true;
const DEBUG_VIEW_X = 40;
const DEBUG_VIEW_Y = 20;
const DEBUG_VIEW_H = 20;

function preload() {
}

function startFn() {
	startFlag = true;
	startTime = millis();
	itemInit(ITEM_W, ITEM_H);
	startButton.hide();
	getCount = 0;
	ballCount = BALL_COUNT_START;
}
function shootFn() {
	if (ballCount>0){
		ball.pos.x = player.pos.x;
		ball.pos.y = player.pos.y;
		ball.speed.x = cos(player.angle)*BALL_SPEED;
		ball.speed.y = sin(player.angle)*BALL_SPEED;
		ball.enable = true;
		ballCount--;
	}
}
function clearFn() {
	clearStorage();
}
function setup() {
	createCanvas(CANVAS_W, CANVAS_H);
	time = millis();
	player = {};
	player.pos = {};
	player.pos.x = PLAYER_X;
	player.pos.y = PLAYER_Y;
	player.angle = PI*3/2;
	items = [];
	ball = {};
	ball.pos = {};
	ball.speed = {};
	ball.enable = false;
	rectMode(CENTER);

	startButton = buttonInit('START', BUTTON_W, BUTTON_H, START_X, START_Y);
	startButton.addEventListener('click', startFn);
	shootButton = buttonInit('SHOOT', BUTTON_W, BUTTON_H, SHOOT_X, SHOOT_Y);
	shootButton.addEventListener('click', shootFn);
	clearButton = buttonInit('CLEAR', GRID_SIZE, GRID_SIZE, 0, CANVAS_H-GRID_SIZE);
	clearButton.addEventListener('click', clearFn);
	joystickInit();
	textAlign(CENTER,CENTER);
	hiScore = getItem('hiScore');
	playerName = getItem('playerName');
	console.log(hiScore);
	if (hiScore==null){
		hiScore = 0;
		storeItem('hiScore', hiScore);
		playerName = 'Player';
	}
	nameInput = createInput(playerName);
	nameInput.position(NAME_INPUT_X, NAME_INPUT_Y);
	nameInput.size(NAME_INPUT_W, NAME_INPUT_H);
	nameInput.hide();
	nameButton = buttonInit('OK', NAME_BUTTON_W, NAME_BUTTON_H, NAME_BUTTON_X, NAME_BUTTON_Y);
	nameButton.addEventListener('click', nameFn);
	nameButton.hide();
}
function buttonInit(text, w, h, x, y) {
	let button = createButton(text);
	button.size(w,h);
	button.position(x,y);
	button.style.fontsize = '64px';
	return button;
}
function nameFn() {
	playerName = nameInput.value;
	storeItem('playerName', playerName);
	nameInput.hide();
	nameButton.hide();
	nameFlag = false;
}
function joystickInit() {
	joystick = {};
	joystick.pos = {};
	joystick.pos.x = JOYSTICK_X;
	joystick.pos.y = JOYSTICK_Y;
	joystick.offset = {};
	joystick.offset.x = 0;
	joystick.offset.y = 0;
	joystick.control = false;
}
function itemInit(w, h) {
	items = [];
	for (let i=0; i<ITEM_NUM; i++){
		items[i] = {};
		items[i].pos = {};
		items[i].pos.x = GRID_SIZE*(2*i+1.5);
		items[i].pos.y = GRID_SIZE*1;
		items[i].w = w;
		items[i].h = h;
		items[i].enable = true;
	}
}
function hitDetect(tx, ty, tw, th, bx, by) {
	if (bx<tx-tw/2 || bx>tx+tw/2){
		return false;
	}
	if (by<ty-th/2 || by>ty+tw/2){
		return false;
	}
	return true;
}
function draw() {
	background(48);
	let current = millis();
	if ( (current-time)>=1000 ){
		time += 1000;
		fps = frameCount - frameCountBuffer;
		frameCountBuffer = frameCount;
	}
	if (DEBUG){
		stroke(128);
		strokeWeight(1);
		for (let i=0; i<CANVAS_H/GRID_SIZE; i++){
			line(0, i*GRID_SIZE, CANVAS_W, i*GRID_SIZE);
		}
		for (let i=0; i<CANVAS_W/GRID_SIZE; i++){
			line(i*GRID_SIZE, 0, i*GRID_SIZE, CANVAS_H);
		}
	}
	if (joystick.control){
		if (joystick.pos.x>=JOYSTICK_X+JOYSTICK_RANGE){
			joystick.pos.x = JOYSTICK_X+JOYSTICK_RANGE;
		}else if(joystick.pos.x<=JOYSTICK_X-JOYSTICK_RANGE){
			joystick.pos.x = JOYSTICK_X-JOYSTICK_RANGE;
		}	
		if (joystick.pos.y>=JOYSTICK_Y+JOYSTICK_RANGE){
			joystick.pos.y = JOYSTICK_Y+JOYSTICK_RANGE;
		}else if(joystick.pos.y<=JOYSTICK_Y-JOYSTICK_RANGE){
			joystick.pos.y = JOYSTICK_Y-JOYSTICK_RANGE;
		}
	}else{
		joystick.pos.x = JOYSTICK_X;
		joystick.pos.y = JOYSTICK_Y;
	}
	joystick.x = (joystick.pos.x-JOYSTICK_X)/JOYSTICK_RANGE;
	joystick.y = -(joystick.pos.y-JOYSTICK_Y)/JOYSTICK_RANGE;
	if (ball.enable){
		ball.pos.x += ball.speed.x;
		ball.pos.y += ball.speed.y;
		if (ball.pos.y<0){
			ball.enable = false;
		}
		circle(ball.pos.x, ball.pos.y, BALL_SIZE);
		let itemNum = 0;
		for (let i=0; i<items.length; i++){
			if (items[i].enable){
				if (hitDetect(items[i].pos.x, items[i].pos.y, ITEM_W, ITEM_H, ball.pos.x, ball.pos.y)){
					items[i].enable = false;
					ball.enable = false;
					getCount++;
				}else{
					itemNum++;
				}
			}
		}
		if (itemNum==0){
			itemInit(ITEM_W/2, ITEM_H/2);
		}
		if (!ball.enable && ballCount==0){
			startFlag = false;
			startButton.show();
			if (getCount>hiScore){
				hiScore = getCount;
				storeItem('hiScore', hiScore);
				nameInput.show();
				nameButton.show();
				nameFlag = true;
			}
		}
	}
	for (let i=0; i<items.length; i++){
		if (items[i].enable){
			rect(items[i].pos.x, items[i].pos.y, items[i].w, items[i].h);
		}
	}
	player.angle += joystick.x/20;
	if (player.angle>((270+PLAYER_ANGLE_MAX)*PI/180)){
		player.angle = (270+PLAYER_ANGLE_MAX)*PI/180;
	}else if (player.angle<((270-PLAYER_ANGLE_MAX)*PI/180)){
		player.angle = (270-PLAYER_ANGLE_MAX)*PI/180;
	}
	push();
	translate(player.pos.x, player.pos.y);
	rotate(player.angle);
	rect(0, 0, PLAYER_W, PLAYER_H);
	pop();
	if (startFlag==false){
		fill(255);
		textSize(48);
		text(getCount, CANVAS_W/2, GRID_SIZE*2);
		text('ハイスコア:'+hiScore+' '+playerName, CANVAS_W/2, GRID_SIZE*4);
	}
	fill(255);
	textSize(64);
	text(ballCount, GRID_SIZE*13, SHOOT_Y+GRID_SIZE*3);
	fill(200);
	noStroke();
	circle(joystick.pos.x, joystick.pos.y, JOYSTICK_SIZE);
	fill(255);
	if (nameFlag){
		fill(64);
		rect(NAME_INPUT_RECT_X, NAME_INPUT_RECT_Y, NAME_INPUT_RECT_W, NAME_INPUT_RECT_H);
		textSize(NAME_INPUT_TEXT_SIZE);
		fill(255);
		text('名前入力', NAME_INPUT_TEXT_X, NAME_INPUT_TEXT_Y);
	}
	fill(255);
	textSize(16);
	let debugY = DEBUG_VIEW_Y;
	text('fps:'+fps, DEBUG_VIEW_X, debugY);
	debugY += DEBUG_VIEW_H;
}
function mousePressed() {
	let tp = [];
	for (let i=0; i<touches.length;i++) {
		if (tp[i]==null){
			tp[i] = [];
		}
		tp[i].x = touches[i].x;
		tp[i].y = touches[i].y;
	}
	let tx, ty;
	if (tp[0]!=null){
		tx = tp[0].x;
		ty = tp[0].y;
	}else{
		tx = mouseX;
		ty = mouseY;
	}
	const d = dist(tx, ty, joystick.pos.x, joystick.pos.y);
	if (d<=JOYSTICK_SIZE/2){
		joystick.control = true;
		joystick.offset.x = joystick.pos.x - tx;
		joystick.offset.y = joystick.pos.y - ty;
	}
}
function mouseReleased() {
	joystick.control = false;
}
function mouseDragged() {
	let tp = [];
	for (let i=0; i<touches.length;i++) {
		if (tp[i]==null){
			tp[i] = [];
		}
		tp[i].x = touches[i].x;
		tp[i].y = touches[i].y;
	}
	let tx, ty;
	if (tp[0]!=null){
		tx = tp[0].x;
		ty = tp[0].y;
	}else{
		tx = mouseX;
		ty = mouseY;
	}
	if (joystick.control){
		joystick.pos.x = tx + joystick.offset.x;
		joystick.pos.y = ty + joystick.offset.y;
	}
	return false;
}