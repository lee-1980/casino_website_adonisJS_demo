import * as helper from "./helper.js";

let _runtime = null;
let winPopupItems = [];

export function init(runtime){
	_runtime = runtime;
	winPopupItems = helper.getObjectsStartsWithName("win_");
}

export function setVisible(state){
	startMenuItems.forEach((item)=>{
		item.isVisible = state;
		item.isEnabled = state;
	 });
}