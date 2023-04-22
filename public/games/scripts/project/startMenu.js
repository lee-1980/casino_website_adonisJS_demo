import * as helper from "./helper.js";

let card40 = null;
let card30 = null;
let card20 = null;
let card10 = null;
let _runtime = null;
let startMenuItems = [];

export function init(runtime){
	_runtime = runtime;
	card40 = runtime.objects.startmenu_card40.getFirstInstance();
	card30 = runtime.objects.startmenu_card30.getFirstInstance();
	card20 = runtime.objects.startmenu_card20.getFirstInstance();
	card10 = runtime.objects.startmenu_card10.getFirstInstance();
	startMenuItems = helper.getObjectsStartsWithName("startmenu");
}
export function reset(){
	setVisible(true);
	card40.setPosition(717.694215, 332.743802);
	card30.setPosition(677.429752, 344.396694);
	card20.setPosition(601.338843, 329.743802);
	card10.setPosition(585.363636, 331.719008);
	card40.behaviors.MoveTo.moveToPosition(755.173554, 173.785124);
	card30.behaviors.MoveTo.moveToPosition(677.429752, 143.173554);
	card20.behaviors.MoveTo.moveToPosition(601.338843, 154.520661);
	card10.behaviors.MoveTo.moveToPosition(529.991736, 178.826446);
}

export function setVisible(state){
	startMenuItems.forEach((item)=>{
		item.isVisible = state;
		item.isEnabled = state;
		
	 });
}