import * as helper from "./helper.js";
import * as cardModule from "./card.js";
let _runtime = null;
let cards = [];
let cardFirstXPos =0;
let cardFirstYPos =0;
let onCardMoveFinishCallBack = null;
let onCardFlipFinishCallBack = null;

export function setonCardMoveFinishCallBack(callback) {
  onCardMoveFinishCallBack = callback;
}
export function setonCardFlipFinishCallBack(callback) {
  onCardFlipFinishCallBack = callback;
}
export function init(runTime) {
  _runtime = runTime;
  cardModule.init(runTime);
}
export function resetPos(){
	cardModule.setPosition(cards[0],cardFirstXPos,cardFirstYPos);
	cardModule.setPosition(cards[1],cardFirstXPos,cardFirstYPos);
}
export function startMove(){
	cardModule.move(cards[0],cardFirstXPos-200,cardFirstYPos);
	cardModule.move(cards[1],cardFirstXPos+200,cardFirstYPos);
}
export function create(){
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
	cardModule.setNumber(cards[index],num);
}
export function setNumberByCard(card,num){
	cardModule.setNumber(card,num);
}
export function flipToFace(index,callback){
	cardModule.flipToFace(cards[index],callback);
}
export function flipToBack(index,callback){
	cardModule.flipToBack(cards[index],callback);
}
export function onCardMoveFinish(card){

	if(card == cards[0])
	cardModule.flipToFace(card,null);
	
	if(onCardMoveFinishCallBack != null){
		onCardMoveFinishCallBack(card);
	}
}
export function setVisibleState(state){
	cards.forEach((_card)=>{
		_card.isVisible = state;
		//cardModule.setTextVisible(_card , state);
	});
}
export function click(card){
	console.log("OnCardClick: ", card);
}