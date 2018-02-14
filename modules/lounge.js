"use strict";
let map;

function init(options) {
	map = setupMap(options);
}

function commands(bot, options, action) {
	const message = action.message;
	const words = message.split(" ");

	let args = words.slice(); // copy words
	args.splice(0, 1); // remove command
	args = args.join(" ");

	const target = args.split(/[ ,]/g).filter(Boolean).join(", ");
	const url = map.get(words[0]);
	if (url) {
		bot.say(action.target, (target ? target + ": " + url : url));
	}
}

function setupMap(options) {
	const temp = new Map();
	temp.set(options.commandPrefix + "css", "https://github.com/thelounge/lounge/wiki/CSS-Modifications");
	temp.set(options.commandPrefix + "wiki", "https://github.com/thelounge/lounge/wiki/");
	temp.set(options.commandPrefix + "docs", "https://thelounge.github.io/docs/");
	temp.set(options.commandPrefix + "releases", "https://github.com/thelounge/lounge/release");
	return temp;
}

module.exports = {init, commands};
