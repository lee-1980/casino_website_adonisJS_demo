import * as helper from "./helper.js";
import * as startMenu from "./startMenu.js";
import * as cards from "./cards.js";
import * as AudioPlayer from "./audioPlayer.js";
import * as hilowbtns from "./hilowbtns.js";
import * as eventGroupManager from "./eventGroupManager.js";
import * as messageBox from "./messageBox.js";
import * as loadingBox from "./loadingBox.js";
import { events } from './events.js';
import * as jasen from "./jasen.js";

let _runtime = null;
let gamePlayMenuItems = [];
const GameStates = {StartMenu: 0,GamePlay: 1,WinPopup: 2,LosePopup: 3,MessageBox:4,Loading:5}

let messageBoxState;

let gameState = 0;
let gamePlayMenuHead = null;
let animationSpeedFactor = 1;
const BtnsStates = {On: 2,Off: 1,Disable: 0}
const BtnsNo = {Equal: 2,Hi: 0,Lo: 1}
let cardReminedSelectCount = 3;
let _cardReminedSelectCountHolder = 3;
let rightCardNum = 0;
let leftCardNum = 0;
let selectedEquality = "";
let rightCount = 0;
let wrongCount = 0;
let rightWrongText = null;

let winPopup = null;
let losePopup = null;
let gamePlayLayer = null;
let settingPopup = null;

let loadingPopup = null;

let volumMuteState = false;

let eventGroupNames = ["StartMenu","WinPopup","LosePopup","GamePlay","MessageBox","Loading"];

let multiplier = 1;
let xrpInitAmount = 1;
let payload_uuidv4 = "";
let ptoken = "";

let prevState = null;

let currentActiveGroupName = null;
let prevActiveGroupName = null;

let winState = true;

let winloseMsg = "";

let startmenu_indicator = null;
let startmenu_multiplier = null;

let multipiersValues = new Map();

runOnStartup(async runtime =>
{
	events.attach(globalThis);
	
	SetGameContainerDiv();
	
	cards.init(runtime);
	helper.init(runtime);
	AudioPlayer.init(runtime);
	jasen.init();
		
	globalThis.on("Backend:StartGame",(leftCard)=>{
		setRightCount(0);
		loadingBox.show(false);
		eventGroupManager.setActiveEventGroup("StartGame");
		leftCardNum = leftCard;
		setLeftCardNumber();
		startGame();
	});
		
	globalThis.on("Backend:NextStep",(leftCard,rightCard,rightCount)=>{
		loadingBox.show(false);
		eventGroupManager.setActiveEventGroup("GamePlay");
		setRightCount(rightCount);
		rightCardNum = rightCard;
		setRightCardNumber();
		leftCardNum = leftCard;
		setLeftCardNumber();
		setCardCount(--cardReminedSelectCount)
		//winState = true;
		
		cards.flipToFace(1,(card)=>{
			AudioPlayer.PlaySFX("right");
			rightWrongText.text = "right";
			rightWrongText.behaviors.Flash.flash(0.1, 0.1, 2);
		});
				
	});
	
	globalThis.on("Backend:Win",(leftCard,rightCard,message)=>{
		loadingBox.show(false);
		winloseMsg = message;
		//eventGroupManager.setActiveEventGroup("WinPopup");
		rightCardNum = rightCard;
		setRightCardNumber();
		setCardCount(0);
		winState = true;
		
		cards.flipToFace(1,(card)=>{
			AudioPlayer.PlaySFX("right");
			rightWrongText.text = "right";
			rightWrongText.behaviors.Flash.flash(0.1, 0.1, 2);
		});
	});
	
	globalThis.on("Backend:Lose",(leftCard,rightCard,message)=>{
		loadingBox.show(false);
		winloseMsg = message;
		//eventGroupManager.setActiveEventGroup("LosePopup");
		rightCardNum = rightCard;
		setRightCardNumber();
		setCardCount(0);
		winState = false;
		
		cards.flipToFace(1,(card)=>{
			AudioPlayer.PlaySFX("wrong");
			rightWrongText.text = "wrong";
			rightWrongText.behaviors.Flash.flash(0.1, 0.1, 2);
		});
	});
	
		
	globalThis.on("Backend:OnWinBet",(state)=>{
	 loadingBox.show(false);
	 if(state)
	 	messageBox.show(true,"Reward was sent to your wallet!");
	 else
	 	messageBox.show(true,"Something went wrong!");
	});
	
	globalThis.on("Backend:Info",(txt)=>{
	 	loadingBox.show(true,txt);
	});
	globalThis.on("Backend:Message",(txt)=>{
	 	loadingBox.show(false);
		messageBox.show(true,txt);
	});
		
	runtime.addEventListener("beforeprojectstart", () => OnBeforeProjectStart(runtime));
	runtime.addEventListener("afterprojectstart", () => OnAfterProjectStart(runtime));
	
	_runtime = runtime;
		
	 globalThis._runtime = runtime;
});


function SetGameContainerDiv(){
	let  wrapper = document.createElement('div');
	wrapper.classList.add('gamecontainer');
	let canvas =  document.getElementsByTagName("canvas"); 
	document.body.appendChild(wrapper);
	wrapper.appendChild(canvas[0]);
}

async function OnAfterProjectStart(runtime){
	globalThis.on('GameOver', OnGameOver);
 
	init(runtime);
	
	showStartMenu(runtime);	

	AudioPlayer.setSfxMute(false);
	
	//console.log(eventGroupManager.getFirstActiveEventGroup())
}
async function OnBeforeProjectStart(runtime)
{	
	//runtime.addEventListener("tick", () => Tick(runtime));
	//runtime.addEventListener("resize", (e) => Resize(e));

	winPopup = runtime.layout.getLayer("WinPopup");
	losePopup = runtime.layout.getLayer("LosePopup");
	gamePlayLayer = runtime.layout.getLayer("GamePlay");
	settingPopup =  runtime.layout.getLayer("Setting");
	
	winPopup.isVisible = false;
	losePopup.isVisible = false;
	settingPopup.isVisible = false;
}


function Resize(e)
{
	console.log(e.cssHeight,e.cssWidth,e.deviceHeight,e.deviceWidth);
}
function Tick(runtime)
{
	
}
export function OnCardClick(cardInstance) {
	cards.click(cardInstance);
}

function setGameState(state){
	gameState = state;
}

function setGamePlayItemsVisible(state){
	hilowbtns.setBtnsVisible(state);
	setGamePlayMenuItemsVisible(state);
	cards.setVisibleState(state);
	gamePlayLayer.isVisible = state;
	hilowbtns.setCanClick(state);
}
function setLeftCardNumber(){
	//leftCardNum = helper.getRandomInt(1,51);
	cards.setNumberByIndex(0,leftCardNum);
} 
function setRightCardNumber(){
	//rightCardNum = helper.getRandomInt(1,51);
	cards.setNumberByIndex(1,rightCardNum);
} 
async function init(runtime){

	multipiersValues.set(3,"1x");
	multipiersValues.set(4,"2x");
	multipiersValues.set(5,"3x");


	messageBox.init(runtime);
	loadingBox.init(runtime);

	startmenu_indicator = _runtime.objects.startmenu_indicator.getFirstInstance();
	startmenu_multiplier = _runtime.objects.startmenu_multiplier.getFirstInstance();

	helper.addChild(startmenu_indicator,startmenu_multiplier);


	rightWrongText = _runtime.objects.gp_writeWrongText.getFirstInstance();
	let obj = {};
	

	startMenu.init(runtime);
	hilowbtns.init(runtime);
	
		
	gamePlayMenuItems  = helper.getObjectsStartsWithName("gp_mn_");
	cards.create();
	cards.setonCardMoveFinishCallBack(
		(card)=>{
			hilowbtns.setBtnsVisible(true);

			hilowbtns.setState(BtnsNo.Equal,BtnsStates.Off);
			hilowbtns.setState(BtnsNo.Hi,BtnsStates.Off);
			hilowbtns.setState(BtnsNo.Lo,BtnsStates.Off);
		}
	);
	//addCardsAriveListeners();
	hilowbtns.setBtnsVisible(false);
	
	gamePlayMenuHead =  runtime.objects.gp_mn_head.getFirstInstance();
	gamePlayMenuAddChilds();
	
	rightWrongText.behaviors.Flash.addEventListener("flashend", e =>
	{
		onRightWrongTextFlashEnd();
	});
	
	AudioPlayer.PlayMusic();

	eventGroupManager.init(eventGroupNames,["MessageBox","Loading"]);
	
	// ["StartMenu","WinPopup","LosePopup","GamePlay","MessageBox","Loading"];
	eventGroupManager.setActiveEventGroup("StartMenu");
	
	OnCardCountSelected(3);
}


function gamePlayMenuAddChilds(){
	gamePlayMenuItems.forEach((item)=>{
		if(item != null)
			helper.addChild(gamePlayMenuHead,item)
	});
}
function setGamePlayMenuItemsVisible(state){
	if(state){
		gamePlayMenuHead.behaviors.MoveTo.moveToPosition(_runtime.getLayout(0).width/2,64);
	}else{
		gamePlayMenuHead.behaviors.MoveTo.moveToPosition(_runtime.getLayout(0).width/2,-80);
	}
}

function setCardCount(count){

	cardReminedSelectCount = count;	
	_runtime.objects.gp_mn_remining.getFirstInstance().text = count.toString();
}
function OnGameOver(isWin){
	setGamePlayItemsVisible(false);
	if(isWin){
		winPopup.isVisible = true;
		setGameState(GameStates.Win);
		// ["StartMenu","WinPopup","LosePopup","GamePlay","MessageBox","Loading"];
		eventGroupManager.setActiveEventGroup("WinPopup");
		//win_scoreCount
		_runtime.objects.win_scoreCount.getFirstInstance().text = (xrpInitAmount * multiplier).toString();

		//globalThis.fire("Backend:winbet",payload_uuidv4, ptoken);
		messageBox.show(true,winloseMsg);
	}else{
		losePopup.isVisible = true;
		setGameState(GameStates.Lose);
		// ["StartMenu","WinPopup","LosePopup","GamePlay","MessageBox","Loading"];
		eventGroupManager.setActiveEventGroup("LosePopup");
		
	}
	
	setWrongCount(0);
	setRightCount(0);
	setCardCount(_cardReminedSelectCountHolder);
	
	cards.flipToBack(0,(card)=>{});
}
/*function gameOver(){
	if(winState){//rightCount == _cardReminedSelectCountHolder){
		globalThis.fire('GameOver',winState);
	}else{
		globalThis.fire('GameOver',false);
	}
}*/

// win_scoreCount
function setRightCount(count){
	rightCount = count;
	_runtime.objects.gp_mn_rightCount.getFirstInstance().text = count.toString();
}
function setWrongCount(count){
	wrongCount = count;
	_runtime.objects.gp_mn_wrongCounter.getFirstInstance().text = count.toString();
}
function onRightWrongTextFlashEnd(){
	//setLeftCardNumber();
	cards.flipToBack(1,(card)=>{
		//setRightCardNumber();
		hilowbtns.setState( BtnsNo.Equal,BtnsStates.Off);
		hilowbtns.setState( BtnsNo.Hi,BtnsStates.Off);
		hilowbtns.setState( BtnsNo.Lo,BtnsStates.Off);
		rightWrongText.text = "";
		
		if(cardReminedSelectCount == 0){
			globalThis.fire('GameOver',winState);
		}else{
			hilowbtns.setCanClick(true);
		}
	});
}

export function onEqualitiBtnClick(){
	AudioPlayer.PlaySFX("click");
	
	hilowbtns.setCanClick(false);

	globalThis.fire("Backend:sendAnswer",selectedEquality);
	loadingBox.show(true,"Please Wait \n Sending Your Answer ...");
	/*cards.flipToFace(1,(card)=>{
	_runtime.objects.gp_writeWrongText.getFirstInstance().behaviors.Flash.flash(0.1, 0.1, 2);
	if(leftCardNum > rightCardNum && selectedEquality == "low"){
		AudioPlayer.PlaySFX("right");
		rightWrongText.text = "right";
		setRightCount(++rightCount);
	}else if(leftCardNum < rightCardNum && selectedEquality == "high"){
		AudioPlayer.PlaySFX("right");
		rightWrongText.text = "right";
		setRightCount(++rightCount);
	}else if(leftCardNum == rightCardNum && selectedEquality == "equal"){
		AudioPlayer.PlaySFX("right");
		rightWrongText.text = "right";
		setRightCount(++rightCount);
	}else {
		AudioPlayer.PlaySFX("wrong");
		rightWrongText.text = "wrong";
		setWrongCount(++wrongCount);
		}
	setCardCount(--cardReminedSelectCount);
	
  });*/
}
function startGame(){
	_runtime.objects.gp_mn_xrpbet.getFirstInstance().text = xrpInitAmount.toString();
	
	
	setGameState(GameStates.GamePlay);
	startMenu.setVisible(false);
	cards.startMove();
	setGamePlayItemsVisible(true);
	
	// ["StartMenu","WinPopup","LosePopup","GamePlay","MessageBox","Loading"];
	eventGroupManager.setActiveEventGroup("GamePlay");
}


// ----------------[[ ]]

export function OnStartBtnClick(){
	if(gameState != GameStates.StartMenu)
		return;
	AudioPlayer.PlaySFX("click");
	xrpInitAmount = _runtime.objects.startmenu_InitBetInput.getFirstInstance().text;
	xrpInitAmount = parseFloat(xrpInitAmount);
	
	loadingBox.show(true,"Loading");
	
	globalThis.fire("Backend:placeBetInit",xrpInitAmount, cardReminedSelectCount);
}
export function OnEqualBtnClick(equal_btn_instant){
	AudioPlayer.PlaySFX("click");
	
	if(gameState != GameStates.GamePlay)
		return;
	if(!hilowbtns.getCanClick()) return;
	
	selectedEquality =  "equal";
	
    hilowbtns.click(equal_btn_instant,BtnsNo.Equal);
    onEqualitiBtnClick();
}
export function OnHiBtnClick(equal_btn_instant){
	AudioPlayer.PlaySFX("click");
   if(gameState != GameStates.GamePlay)
		return;
		if(!hilowbtns.getCanClick()) return;
	selectedEquality = "high";
	hilowbtns.click(equal_btn_instant,BtnsNo.Hi);
	onEqualitiBtnClick();
}
export function OnLowBtnClick(equal_btn_instant){
	AudioPlayer.PlaySFX("click");

	if(gameState != GameStates.GamePlay)
		return;
		if(!hilowbtns.getCanClick()) return;
		
	selectedEquality ="low";
	hilowbtns.click(equal_btn_instant,BtnsNo.Lo);
	onEqualitiBtnClick();
}



export function OnCardCountSelected(count){
	AudioPlayer.PlaySFX("click");

	startmenu_multiplier.text = multipiersValues.get(count);
	_runtime.objects.gp_mn_multiper.getFirstInstance().text =  multipiersValues.get(count);
		
	_cardReminedSelectCountHolder = count;
	setCardCount(count);
	console.log("cardcount: ",count);
}
export function OnTryAgainBtnClick(){
	AudioPlayer.PlaySFX("click");
	losePopup.isVisible = false;
	setGamePlayItemsVisible(true);
	cards.resetPos();
	cards.startMove();
	setGameState(GameStates.GamePlay);
	
	// ["StartMenu","WinPopup","LosePopup","GamePlay","MessageBox","Loading"];
	eventGroupManager.setActiveEventGroup("GamePlay");
}
export function OnContinueBtnClick(){
	AudioPlayer.PlaySFX("click");

	winPopup.isVisible = false;
	setGamePlayItemsVisible(true);
	cards.resetPos();
	cards.startMove();
	setGameState(GameStates.GamePlay);
	
	// ["StartMenu","WinPopup","LosePopup","GamePlay","MessageBox","Loading"];
	eventGroupManager.setActiveEventGroup("GamePlay");
}

export function ToggleSound(){
	volumMuteState = !volumMuteState;
	
	AudioPlayer.setSfxMute(volumMuteState);
	AudioPlayer.setMusicMute(volumMuteState);
	
	if(volumMuteState){
		_runtime.objects.gp_mn_volume.getFirstInstance().animationFrame = 1;
		
	}else{
		_runtime.objects.gp_mn_volume.getFirstInstance().animationFrame = 0;
			//AudioPlayer.PlayMusic();
	}
}

export function showStartMenu(){
	AudioPlayer.PlaySFX("click");

	setGameState(GameStates.StartMenu);
	
	startMenu.reset();
	cards.resetPos();
	
	setGamePlayItemsVisible(false);
	
	//setRightCardNumber();
	//setLeftCardNumber();
	
	rightWrongText.text = "";
	setWrongCount(0);
	setRightCount(0);
	
	winPopup.isVisible = false;
	losePopup.isVisible = false;
	
	// ["StartMenu","WinPopup","LosePopup","GamePlay","MessageBox","Loading"];
	eventGroupManager.setActiveEventGroup("StartMenu");
}
export function OnInitBetInputChange()
{
	let startmenu_InitBetInput = _runtime.objects.startmenu_InitBetInput.getFirstInstance();
	if(parseFloat(startmenu_InitBetInput.text) > 100){
		startmenu_InitBetInput.text = "100";
	}else if(parseFloat(startmenu_InitBetInput.text) < 1){
		startmenu_InitBetInput.text = "1";
	}
}

export function onMessageBoxOkBtnClick(){
	messageBox.show(false);
}
