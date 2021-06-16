document.getElementById("arm").addEventListener('webkitAnimationEnd', function(){
    this.style.webkitAnimationName = '';
	document.body.className = "";
}, false);

document.body.onkeypress = function(){
    document.getElementById("arm").style.webkitAnimationName = 'shake';
	document.body.className = "smile";
	audio().play();
};

var can = true;
var sounds = [
	{tag:new Audio("audio/goedemorgen.wav"), before: 12},
	{tag:new Audio("audio/hoihoi.wav")},
	{tag:new Audio("audio/hallo.wav")},
	{tag:new Audio("audio/goedemiddag.wav"), after: 12},
	{tag:new Audio("audio/burp.wav"), custom: function(){ return Math.random()>.7; }}
	];
var cd;

function isMorning(){ return (cd = (new Date).getHours()) > 6 && cd < 10; }
function audio(){
	var pos = [], h = (new Date()).getHours();
	for(var n = 0; n < sounds.length; n++){
		var add = true;
		if(sounds[n].before && sounds[n].before < h) add = false;
		if(sounds[n].after && sounds[n].after > h) add = false;
		if(sounds[n].custom && !sounds[n].custom()) add = false;
		if(!sounds[n].tag.play) add = false;
		if(add)
			pos.push(sounds[n].tag);
	}
	var index = Math.round(Math.random()*(pos.length-1));
	return pos[index];
}

function goedemorgen(){
    if(can){
		document.getElementById("arm").style.webkitAnimationName = 'shake';
		document.body.className = "smile";
		audio().play();
		can = false;
		setTimeout(function(){
			can = true;
		}, 1000 * (isMorning() && 5 || 3*60) );
	}
}