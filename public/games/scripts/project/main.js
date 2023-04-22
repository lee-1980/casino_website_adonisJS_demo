import * as helper from "./helper.js";
import * as startMenu from "./startMenu.js";
import * as cards from "./cards.js";
import * as AudioPlayer from "./audioPlayer.js";
import * as hilowbtns from "./hilowbtns.js";
import * as eventGroupManager from "./eventGroupManager.js";
import { events } from './events.js';
import * as jasen from "./jasen.js";

let _runtime = null;
let gamePlayMenuItems = [];
const GameStates = {StartMenu: 0,GamePlay: 1,Win: 2,Lose: 3}
const MsgBoxStates = {Nothing : 0, StartFailed: 1,WinSuccess: 2,WinErr: 3}
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
let selectedEquality = 0;
let rightCount = 0;
let wrongCount = 0;
let rightWrongText = null;

let winPopup = null;
let losePopup = null;
let gamePlayLayer = null;
let settingPopup = null;
let messageBoxPopup = null;
let loadingPopup = null;

let volumMuteState = false;

let eventGroupNames = ["StartMenu","WinPopup","LosePopup","GamePlay","MessageBox","Loading"];

let multiplier = 1.5;
let xrpInitAmount = 0.00003;

let payload_uuidv4 = "";
let ptoken = "";

runOnStartup(async runtime =>
{
	events.attach(globalThis);
	
	/// Nothing  StartFailed WinSuccess WinErr
	messageBoxState = MsgBoxStates.Nothing;
	
	/*globalThis.on('SetInventory', (data)=>{
		runtime.objects.gp_mn_total.getFirstInstance().text = data.toString();
	});
	globalThis.on('SetMultiplier', (data)=>{
		runtime.objects.gp_mn_multiper.getFirstInstance().text = data.toString();
	});
	globalThis.on('SetXRPBet', (data)=>{
		runtime.objects.gp_mn_xrpbet.getFirstInstance().text = data.toString();
	});*/
	
	globalThis.on("Backend:OnPaymentResultRecived",(result,payload_uuidv4)=>{
		OnPaymentResultRecived(result,payload_uuidv4);
	});
		
	globalThis.on("Backend:OnWinBet",(state)=>{
	 ShowLoadingBox(false);
	 if(state)
	 	ShowMessageBox(true, MsgBoxStates.WinSuccess,"Reward was sent to your wallet!");
	 else
	 	ShowMessageBox(true,MsgBoxStates.WinErr,"Something went wrong!");
	});
	
	globalThis.on("Backend:Alert",(txt)=>{
	 	ShowLoadingBox(true,txt);
	});
		
	runtime.addEventListener("beforeprojectstart", () => OnBeforeProjectStart(runtime));
	runtime.addEventListener("afterprojectstart", () => OnAfterProjectStart(runtime));
	
	cards.init(runtime);
	helper.init(runtime);
	jasen.init();
	
	_runtime = runtime;
		
	 globalThis._runtime = runtime;
	 
	SetGameContainerDiv();
	 
	
});

//-------------- Jasen
function OnPaymentResultRecived(result,_payload_uuidv4){
	ShowLoadingBox(false);

	console.log(result,_payload_uuidv4);
	if(typeof result === "string"){
		result = JSON.parse(result);
	}
	if(result && 
	result != null && 
	result != undefined && 
	typeof result === "object" && 
	result.game && 
	result.game != null && 
	result.game != undefined &&
	result.game == "success"
	){
	console.log("---[[ game start",result);
	
 	payload_uuidv4 = _payload_uuidv4;
 	ptoken = result.token;

		try {
		  localStorage.setItem("ptoken", ptoken);
		  localStorage.setItem("payload_uuidv4", _payload_uuidv4);
		} catch (e) {
		  console.log(e);
		}
		startGame();
	}else{
		console.log("---[[ game can't start  payment failed");
	
		ShowMessageBox(true,MsgBoxStates.StartFailed, "Payment is Failed");
	}
}


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
}
async function OnBeforeProjectStart(runtime)
{	
	//runtime.addEventListener("tick", () => Tick(runtime));
	//runtime.addEventListener("resize", (e) => Resize(e));

	winPopup = runtime.layout.getLayer("WinPopup");
	losePopup = runtime.layout.getLayer("LosePopup");
	gamePlayLayer = runtime.layout.getLayer("GamePlay");
	settingPopup =  runtime.layout.getLayer("Setting");
	messageBoxPopup =  runtime.layout.getLayer("MessageBox");
	loadingPopup =  runtime.layout.getLayer("Loading");
	
	winPopup.isVisible = false;
	losePopup.isVisible = false;
	settingPopup.isVisible = false;
	ShowMessageBox(false);
	ShowLoadingBox(false);
}
function ShowLoadingBox(isVisible,msg=""){
	loadingPopup.isVisible = isVisible;
	
	let msgTextBox = _runtime.objects.loading_message.getFirstInstance();
	msgTextBox.text = msg;
		
	if(msg.length <= 10){
		msgTextBox.sizePt = 40;
	}else{
		msgTextBox.sizePt = 40- (( msg.length / 170 ) * 27);
	}
	
	if(isVisible){
		// ["StartMenu","WinPopup","LosePopup","GamePlay","MessageBox","Loading"];
		eventGroupManager.setActiveEventGroup("Loading");
	}
}
function ShowMessageBox(isVisible,state = MsgBoxStates.Nothing,msg=""){
	messageBoxPopup.isVisible = isVisible;
	_runtime.objects.messageBoxMsg.getFirstInstance().text = msg;
	messageBoxState = state;
	
	if(isVisible){
		// ["StartMenu","WinPopup","LosePopup","GamePlay","MessageBox","Loading"];
		eventGroupManager.setActiveEventGroup("MessageBox");
	}
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
	leftCardNum = helper.getRandomInt(1,51);
	cards.setNumberByIndex(0,leftCardNum);
} 
function setRightCardNumber(){
	rightCardNum = helper.getRandomInt(1,51);
	cards.setNumberByIndex(1,rightCardNum);
} 
async function init(runtime){
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

	eventGroupManager.init(eventGroupNames);
	
	// ["StartMenu","WinPopup","LosePopup","GamePlay","MessageBox","Loading"];
	eventGroupManager.setActiveEventGroup("StartMenu");
	
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
		ShowLoadingBox(true,"Loading");
		globalThis.fire("Backend:winbet",payload_uuidv4, ptoken);
		
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
function gameOver(){
	
	if(rightCount == _cardReminedSelectCountHolder){
		globalThis.fire('GameOver',true);
	}else{
		globalThis.fire('GameOver',false);
	}
}
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
	setLeftCardNumber();
	cards.flipToBack(1,(card)=>{
		setRightCardNumber();
		hilowbtns.setState( BtnsNo.Equal,BtnsStates.Off);
		hilowbtns.setState( BtnsNo.Hi,BtnsStates.Off);
		hilowbtns.setState( BtnsNo.Lo,BtnsStates.Off);
		rightWrongText.text = "";
		
		if(cardReminedSelectCount == 0){
			gameOver();
		}else{
			hilowbtns.setCanClick(true);
		}
	});
}

export function onEqualitiBtnClick(){
	AudioPlayer.PlaySFX("click");
	
	hilowbtns.setCanClick(false);
	cards.flipToFace(1,(card)=>{
	_runtime.objects.gp_writeWrongText.getFirstInstance().behaviors.Flash.flash(0.1, 0.1, 2);
	if(leftCardNum > rightCardNum && selectedEquality == -1){
		AudioPlayer.PlaySFX("right");
		rightWrongText.text = "right";
		setRightCount(++rightCount);
	}else if(leftCardNum < rightCardNum && selectedEquality == 1){
		AudioPlayer.PlaySFX("right");
		rightWrongText.text = "right";
		setRightCount(++rightCount);
	}else if(leftCardNum == rightCardNum && selectedEquality == 0){
		AudioPlayer.PlaySFX("right");
		rightWrongText.text = "right";
		setRightCount(++rightCount);
	}else {
		AudioPlayer.PlaySFX("wrong");
		rightWrongText.text = "wrong";
		setWrongCount(++wrongCount);
		}
	setCardCount(--cardReminedSelectCount);
  });
}
function startGame(){
	_runtime.objects.gp_mn_xrpbet.getFirstInstance().text = xrpInitAmount.toString();
	_runtime.objects.gp_mn_multiper.getFirstInstance().text = multiplier.toString();
	
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
	
	ShowLoadingBox(true,"Loading");
	
	globalThis.fire("Backend:placeBetInit",xrpInitAmount, multiplier);
}
export function OnEqualBtnClick(equal_btn_instant){
	AudioPlayer.PlaySFX("click");
	
	if(gameState != GameStates.GamePlay)
		return;
	if(!hilowbtns.getCanClick()) return;
	selectedEquality = 0;
    hilowbtns.click(equal_btn_instant,BtnsNo.Equal);
    onEqualitiBtnClick();
}
export function OnHiBtnClick(equal_btn_instant){
	AudioPlayer.PlaySFX("click");
   if(gameState != GameStates.GamePlay)
		return;
		if(!hilowbtns.getCanClick()) return;
	selectedEquality = 1;
	hilowbtns.click(equal_btn_instant,BtnsNo.Hi);
	onEqualitiBtnClick();
}
export function OnLowBtnClick(equal_btn_instant){
	AudioPlayer.PlaySFX("click");

	if(gameState != GameStates.GamePlay)
		return;
		if(!hilowbtns.getCanClick()) return;
	selectedEquality = -1;
	hilowbtns.click(equal_btn_instant,BtnsNo.Lo);
	onEqualitiBtnClick();
}
export function OnCardCountSelected(count){
	AudioPlayer.PlaySFX("click");

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
	
	setRightCardNumber();
	setLeftCardNumber();
	
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
	if(parseFloat(startmenu_InitBetInput.text) > 150){
		startmenu_InitBetInput.text = "150";
	}
}

export function onMessageBoxOkBtnClick(){

	/// Nothing  StartFailed WinSuccess WinErr
	switch(messageBoxState ){
		case MsgBoxStates.Nothing:
		
		break;
		case MsgBoxStates.StartFailed:
			// ["StartMenu","WinPopup","LosePopup","GamePlay","MessageBox","Loading"];
			eventGroupManager.setActiveEventGroup("StartMenu");
		break;
		case MsgBoxStates.WinSuccess:
			ShowLoadingBox(false);
			eventGroupManager.setActiveEventGroup("WinPopup");
		break;
		case MsgBoxStates.WinErr:
				ShowLoadingBox(false);
			eventGroupManager.setActiveEventGroup("WinPopup");
		break;
	}
	
	ShowMessageBox(false);
}
