import * as howler from "./howler.core.js";


// References to loaded audio files as global variables
let flip = null;
let move = null;
let music = null;
let isSFXMuted = false;
let isMusicMuted = false;
let audios = [];
let audiosMap = new Map();

let _runtime = null;
runOnStartup(async runtime =>
{
	_runtime = runtime;

	audios = ["card_flip","card_move","music","right","wrong","click"];

	for await (const _name of audios) {
		let audioUrl = getFileUrl(_name);
		var sound = new Howl({
			src: [audioUrl],
			html5: true
		});
		audiosMap.set(_name,sound);
	};
});
function getFileUrl(name){
	let url = name + ".webm";
	const audioUrl = _runtime.assets.mediaFolder + url;
	return audioUrl;
}
export function setSfxMute(state)
{
	isSFXMuted = state;
}
export function setMusicMute(state)
{
	isMusicMuted = state;
	//if(isMusicMuted)
		audiosMap.get("music").mute(isMusicMuted);
}

export function PlaySFX(name)
{	if(!isSFXMuted)
	audiosMap.get(name).play();
}

export function PlayMusic()
{
	if(!isMusicMuted)
		audiosMap.get("music").play();
}