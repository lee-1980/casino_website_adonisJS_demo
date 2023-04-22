import * as helper from "./helper.js";
import * as AudioPlayer from "./audioPlayer.js";

let _runtime = null;

let cardTexts = new Map();
let cardYPos = 0;
let cardXPos = 0;
let cardXScale = 1;
let cardHeight = 328;

export function init(runTime) {
  _runtime = runTime;
}

export function create(xPos,yPos){
	let layerName = "GamePlay";
	let card = _runtime.objects.gp_card.createInstance(layerName,xPos,yPos,false,"");
	let tx1 = _runtime.objects.gp_MainCardNumberText.createInstance(layerName,xPos-91,yPos-133,false,"");
	let tx2 = _runtime.objects.gp_MainCardNumberText.createInstance(layerName,xPos+93,yPos+147,false,"");
	
	let tx = _runtime.objects.gp_MainCardNumberText.createInstance(layerName,xPos,yPos+11,false,"");
	
	let title_tx = _runtime.objects.card_clubootopiatitle.createInstance(layerName,xPos,yPos+116,false,"");
	
	
	tx.height = 118.791749;
	tx.width = 105.619959;
	tx.sizePt = 66;
	
	helper.addChild(card,tx1);
	helper.addChild(card,tx);
	helper.addChild(card,tx2);
	
	helper.addChild(card,title_tx);
	 
	cardTexts.set(card,[tx1,tx,tx2,title_tx]);
	 
	return card;
}


async function flip(card,targetxscale,callBack = null){
	
		
	const tween = card.behaviors.Tween.startTween("scale", [targetxscale,1], 0.5, "in-out-sine");
	// Wait for the tween to finish
	await tween.finished;
	
	if(callBack != null)
	 	callBack(card);
}
export function setTextVisible(card , state){
	 cardTexts.get(card)[0].isVisible =  state;
	 cardTexts.get(card)[1].isVisible =  state;
	 cardTexts.get(card)[2].isVisible =  state;
	 
	 cardTexts.get(card)[3].isVisible =  !state;
}
export function flipToBack(card,callback){
AudioPlayer.PlaySFX("card_flip");
	flip(card,0.01,(_card)=>{
		flip(_card,cardXScale,callback);	
		setTextVisible(_card,false);
		_card.animationFrame = 0;
	});
}
export function flipToFace(card,callback){
AudioPlayer.PlaySFX("card_flip");
	flip(card,0.01,(_card)=>{
		flip(_card,cardXScale,callback);	
		setTextVisible(_card,true);
		_card.animationFrame = 1;
	});
}
function toggleFlip(){
	/*flipCard(index,cardXScale,null);
	setTextVisible(index,true);
	cards[index].animationFrame = 1;*/
}

export function addAriveListeners(card,callBack){
	card.behaviors.MoveTo.addEventListener("arrived", e =>
	{
		callBack(card);
	});
}
	
export function setNumber(card,num){
	 cardTexts.get(card)[0].text =  num.toString();
	 cardTexts.get(card)[1].text = num.toString();
	 cardTexts.get(card)[2].text = num.toString();
}

export function move(card,xPos,yPos){
	AudioPlayer.PlaySFX("card_move");
	card.behaviors.MoveTo.moveToPosition(xPos,yPos);
}
export function setPosition(card,xPos,yPos){
	card.setPosition(xPos,yPos);
}