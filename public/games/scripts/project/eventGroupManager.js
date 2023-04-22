let eventGroupsMap = new Map();
/// this madoule need c3 runtime importer plugin made by mrbaghbani.ir
export function init(namesArr){
	namesArr.forEach((_name)=>{
		eventGroupsMap.set(_name,getEventGroupByName(_name));
	});
}

export function setActiveEventGroup(name){
	for (let _name of eventGroupsMap.keys()) { 
		if(_name == name)
			eventGroupsMap.get(_name).SetGroupActive(true);
		else
			eventGroupsMap.get(_name).SetGroupActive(false);
	}
}
function SetEventGroupActive(name,state){
	let group = globalThis.c3_runtime.GetEventSheetManager().GetEventGroupByName(name);
	group.SetGroupActive(state);
}
function getEventGroupByName(name){
	return globalThis.c3_runtime.GetEventSheetManager().GetEventGroupByName(name);
}