import * as eventGroupManager from "./eventGroupManager.js";

let _runtime = null;
let loadingPopup = null;

export function init(runtime){
	_runtime = runtime;
	loadingPopup =  runtime.layout.getLayer("Loading");
	show(false);
}
export function show(isVisible,msg=""){
	loadingPopup.isVisible = isVisible;
	
	let msgTextBox = _runtime.objects.loading_message.getFirstInstance();
	msgTextBox.text = msg;
		
	if(msg.length <= 10){
		msgTextBox.sizePt = 40;
	}else{
		msgTextBox.sizePt = 40 - (( msg.length / 170 ) * 30);
	}
	
	if(isVisible){
		eventGroupManager.setActiveEventGroup("Loading");
	}else{
		eventGroupManager.activatePrevActiveEventGroup();
	}
}