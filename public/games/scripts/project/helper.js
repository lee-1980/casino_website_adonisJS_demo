let _runtime = null;
export function init(runtime) {
	_runtime = runtime;
}
export function getObjectsStartsWithName(name){
	let arr = [];
	Object.keys(_runtime.objects).forEach((_name)=>{
		if(_name.startsWith(name))
			arr.push(_runtime.objects[_name].getFirstInstance());
	 });
	return arr;
}
export function addChild(parent,child){
	//parent
	parent.addChild(child,{
		transformX:true,
		transformY:true,
		transformWidth:true,
		transformHeight:true,
		transformAngle:true,
		transformZElevation:true,
		destroyWithParent:true
	});
}
export function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}