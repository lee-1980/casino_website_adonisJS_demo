
let hiBtn;
let lowBtn;
let equalBtn;
let _runtime = null;
const BtnsStates = {On: 2,Off: 1,Disable: 0}
const BtnsNo = {Equal: 2,Hi: 0,Lo: 1}
let canClick = true;
let obj = null;
export function init(runTime) {
  _runtime = runTime;
  	hiBtn = _runtime.objects.gp_hi_btn.getFirstInstance();
	lowBtn = _runtime.objects.gp_lo_btn.getFirstInstance();
	equalBtn = _runtime.objects.gp_equal_btn.getFirstInstance();
}
export function setCanClick(state){
	canClick = state;
}
export function getCanClick(){
	return canClick;
}
export function setBtnsVisible(state){
	hiBtn.isVisible = state;
	lowBtn.isVisible = state;
	equalBtn.isVisible = state;
}
export function setState(no,state){
//BtnsStates
	switch(no){
		case BtnsNo.Equal:
			equalBtn.animationFrame = state;
		break;
		case BtnsNo.Hi:
			hiBtn.animationFrame = state;
		break;
		case BtnsNo.Lo:
			lowBtn.animationFrame = state;
		break;
	}

}
// btnNo = btnno enum
//state = btn state enum
// btn_no = btn no enum
export function click(btnInstance,btn_no){
	if(!canClick) return;
	if(btnInstance.animationFrame != BtnsStates.On && btnInstance.animationFrame != BtnsStates.Disable){
		setState( BtnsNo.Equal,BtnsStates.Off);
		setState( BtnsNo.Hi,BtnsStates.Off);
		setState( BtnsNo.Lo,BtnsStates.Off);
		setState( btn_no,BtnsStates.On);
	}	
}