
// Import the main script as Main so scripts in
// events can access methods like Main.PlaySfx5().
import * as Main from "./main.js";



const scriptsInEvents = {

	async EventSheet1_Event2_Act5(runtime, localVars)
	{
		globalThis.btnsEqualities = [];
		globalThis.btnNumber = [];
		
	},

	async EventSheet1_Event7_Act1(runtime, localVars)
	{
		Main.OnEqualBtnClick(runtime.objects.gp_equal_btn.getFirstPickedInstance());
	},

	async EventSheet1_Event8_Act1(runtime, localVars)
	{
		Main.OnHiBtnClick(runtime.objects.gp_hi_btn.getFirstPickedInstance());
	},

	async EventSheet1_Event9_Act1(runtime, localVars)
	{
		Main.OnLowBtnClick(runtime.objects.gp_lo_btn.getFirstPickedInstance());
	},

	async EventSheet1_Event11_Act1(runtime, localVars)
	{
		Main.ToggleSound();
	},

	async EventSheet1_Event13_Act2(runtime, localVars)
	{
		Main.OnCardCountSelected(3);
	},

	async EventSheet1_Event14_Act2(runtime, localVars)
	{
		Main.OnCardCountSelected(4);
	},

	async EventSheet1_Event15_Act2(runtime, localVars)
	{
		Main.OnCardCountSelected(5);
	},

	async EventSheet1_Event16_Act1(runtime, localVars)
	{
		Main.OnStartBtnClick();
		
	},

	async EventSheet1_Event18_Act1(runtime, localVars)
	{
		Main.OnInitBetInputChange();
	},

	async EventSheet1_Event20_Act1(runtime, localVars)
	{
		Main.showStartMenu();
	},

	async EventSheet1_Event21_Act1(runtime, localVars)
	{
		Main.OnContinueBtnClick();
	},

	async EventSheet1_Event23_Act1(runtime, localVars)
	{
		Main.OnTryAgainBtnClick();
	},

	async EventSheet1_Event24_Act1(runtime, localVars)
	{
		Main.showStartMenu();
	},

	async EventSheet1_Event26_Act1(runtime, localVars)
	{
		Main.onMessageBoxOkBtnClick();
	}

};

self.C3.ScriptsInEvents = scriptsInEvents;

