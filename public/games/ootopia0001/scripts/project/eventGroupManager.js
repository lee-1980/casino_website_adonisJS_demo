let eventGroupsMap = new Map();
let exceptArr = [];
let eventSheetManager = null;
let currentActiveGroupName = null;
let prevActiveGroupName = null;
/// this madoule need c3 runtime importer plugin made by mrbaghbani.ir
export function init(namesArr,_exceptArr){
	exceptArr = _exceptArr;
	eventSheetManager = globalThis.c3_runtime.GetEventSheetManager();
	namesArr.forEach((_name)=>{
		eventGroupsMap.set(_name,getEventGroupByName(_name));
	});
}

export function setActiveEventGroup(name){
	if(currentActiveGroupName != null)
		prevActiveGroupName = currentActiveGroupName;
	if(!exceptArr.includes(name))
		currentActiveGroupName = name;
	
	for (let _name of eventGroupsMap.keys()) { 
		if(_name == name)
			eventGroupsMap.get(_name).SetGroupActive(true);
		else
			eventGroupsMap.get(_name).SetGroupActive(false);
	}
}
export function activatePrevActiveEventGroup(){
	let prevGroup = null;
	if(prevActiveGroupName != null)
		prevGroup = eventGroupsMap.get(prevActiveGroupName);
	if(prevGroup != null && prevGroup != undefined)	
		prevGroup.SetGroupActive(true);
}

function SetEventGroupActive(name,state){
	let group = eventSheetManager.GetEventGroupByName(name);
	group.SetGroupActive(state);
}
function getEventGroupByName(name){
	return eventSheetManager.GetEventGroupByName(name);
}


