"use strict";
var commands = function(bot, options, action) {
	if (action.message === options.commandPrefix + "css") {
		bot.say(action.target, "https://github.com/thelounge/lounge/wiki/CSS-Modifications");
	} else if (action.message === options.commandPrefix + "rp") {
		bot.say(action.target, "https://github.com/thelounge/lounge/wiki/Reverse-Proxies");
	}
};

module.exports = {commands};
