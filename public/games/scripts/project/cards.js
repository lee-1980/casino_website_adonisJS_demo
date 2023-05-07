import * as helper from "./helper.js";
import * as cardModule from "./card.js";
let _runtime = null;
let cards = [];
let cardFirstXPos =0;
let cardFirstYPos =0;
let onCardMoveFinishCallBack = null;
let onCardFlipFinishCallBack = null;
let isCardModuleInit = false;
export function setonCardMoveFinishCallBack(callback) {
  onCardMoveFinishCallBack = callback;
}
export function setonCardFlipFinishCallBack(callback) {
  onCardFlipFinishCallBack = callback;
}
export function init(runTime) {
  _runtime = runTime;
  cardModule.init(runTime);
  isCardModuleInit = true;
}
export function resetPos(){
	if(!isCardModuleInit) return;
	
	cardModule.setPosition(cards[0],cardFirstXPos,cardFirstYPos);
	cardModule.setPosition(cards[1],cardFirstXPos,cardFirstYPos);
}
export function startMove(){
	if(!isCardModuleInit) return;
	
	cardModule.move(cards[0],cardFirstXPos-200,cardFirstYPos);
	cardModule.move(cards[1],cardFirstXPos+200,cardFirstYPos);
}
export function create(){
	if(!isCardModuleInit) return;
	
	cardFirstXPos = _runtime.getLayout(0).width/2;
	cardFirstYPos = _runtime.getLayout(0).height/2;

	let _card1 = cardModule.create(cardFirstXPos,cardFirstYPos);
	cards.push(_card1);

	let	_card2 = cardModule.create(cardFirstXPos,cardFirstYPos);
	cards.push(_card2);
	
	cardModule.setTextVisible(_card1,false);
	cardModule.setTextVisible(_card2,false);
	
	cardModule.addAriveListeners(cards[0],onCardMoveFinish);
	cardModule.addAriveListeners(cards[1],onCardMoveFinish);
	

}
export function setNumberByIndex(index,num){
	if(!isCardModuleInit) return;
	
	cardModule.setNumber(cards[index],num);
}
export function setNumberByCard(card,num){
	if(!isCardModuleInit) return;
	
	cardModule.setNumber(card,num);
}
export function flipToFace(index,callback){
	if(!isCardModuleInit) return;
	
	cardModule.flipToFace(cards[index],callback);
}
export function flipToBack(index,callback){
	if(!isCardModuleInit) return;
	
	cardModule.flipToBack(cards[index],callback);
}
export function onCardMoveFinish(card){
	if(!isCardModuleInit) return;
	

	if(card == cards[0])
	cardModule.flipToFace(card,null);
	
	if(onCardMoveFinishCallBack != null){
		onCardMoveFinishCallBack(card);
	}
}
export function setVisibleState(state){
	if(!isCardModuleInit) return;
	
	cards.forEach((_card)=>{
		_card.isVisible = state;
		//cardModule.setTextVisible(_card , state);
	});
}
export function click(card){
	if(!isCardModuleInit) return;
	
	//console.log("OnCardClick: ", card);
}