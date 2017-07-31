"use strict";

var commands = function(bot, options, action) {
	if (options.owners.indexOf(action.nick) < 0) {
		return;
	}
	if (action.message.startsWith(options.botName)) {
		const command = action.message.split(" ");
		command.shift();
		if (command[0] === "join") {
			bot.join(command[1]);
		} else if (command[0] === "part" || command[0] === "leave" || command[0] === "exit") {
			if (command[1] === "undefined" || command[1] === null) {
				bot.part(action.target, action.nick + " asked me to leave.");
			} else {
				bot.part(command[1], action.nick + " asked me to leave.");
			}
		} else if (command[0] === "say" || command[0] === "echo") {
			const message = command;
			message.shift();
			bot.say(action.target, message.join(" "));
		}
	}
};

module.exports = {commands};
