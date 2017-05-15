"use strict";
var commands = function(bot, options, action) {
	if (action.message === options.commandPrefix + "css") {
		bot.say(action.target, "https://github.com/thelounge/lounge/wiki/CSS-Modifications");
	} else if (action.message === options.commandPrefix + "rp") {
		bot.say(action.target, "https://github.com/thelounge/lounge/wiki/Reverse-Proxies");
	} else if (action.message === options.commandPrefix + "diff") {
		bot.say(action.target, "https://github.com/thelounge/lounge/wiki/Differences-between-The-Lounge-and-Shout");
	}
};

module.exports = {commands};
