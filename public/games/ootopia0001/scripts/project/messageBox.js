import * as eventGroupManager from "./eventGroupManager.js";

let _runtime = null;
let messageBoxPopup = null;

export function init(runtime){
	_runtime = runtime;
	messageBoxPopup =  runtime.layout.getLayer("MessageBox");
	show(false);
}
export function show(isVisible,msg=""){
	messageBoxPopup.isVisible = isVisible;
	let msgTextBox = _runtime.objects.messageBoxMsg.getFirstInstance();
	msgTextBox.text = msg;
	
	if(msg.length <= 10)
		msgTextBox.sizePt = 40;
	else
		msgTextBox.sizePt = 35 - (( msg.length / 170 ) * 30);
		
	if(isVisible){
		eventGroupManager.setActiveEventGroup("MessageBox");
	}else{
		eventGroupManager.activatePrevActiveEventGroup();
	}
}