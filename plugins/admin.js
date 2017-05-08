var commands = function(bot, options, action) {
	if (options.owners.indexOf(action.nick) < 0) return;
	if (action.message.startsWith("lounge-botter,")) {
		let command = action.message.split(" ");
		command.shift();
		if (command[0] === "join") {
			bot.join(command[1]);
		} else if (command[0] === "part") {
			if (command[1] == 'undefined' || command[1] == null) {
				bot.part(action.target, action.nick + " asked me to leave.");
			} else {
				bot.part(command[1], action.nick + " asked me to leave.");
			}
		} else if (command[0] === "say") { // todo: doesn't work
			let message = command;
			message.shift();
			bot.say(action.target, message.join(" "));
		}
	}
}

module.exports = { commands };