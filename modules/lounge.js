"use strict";
var commands = function(bot, options, action) {
	let target = action.target;
	if (action.target === bot.user.nick) {
		target = action.nick;
	}

	if (action.message === options.commandPrefix + "css") {
		bot.say(target, "https://github.com/thelounge/lounge/wiki/CSS-Modifications");
	} else if (action.message === options.commandPrefix + "rp") {
		bot.say(target, "https://github.com/thelounge/lounge/wiki/Reverse-Proxies");
	} else if (action.message === options.commandPrefix + "diff") {
		bot.say(target, "https://github.com/thelounge/lounge/wiki/Differences-between-The-Lounge-and-Shout");
	}
};

module.exports = {commands};
