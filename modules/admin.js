"use strict";

const {spawn} = require("child_process");
const util = require("../util");

const commands = function(bot, options, action) {
	if (!options.owners.includes(action.nick)) {
		return;
	}

	if (!action.message.startsWith(options.botName)) {
		return;
	}

	util.log(`[admin cmd] ${action.target}: <${action.nick}> ${action.message}`);

	const command = action.message.split(" ");
	command.shift();

	if (command[0] === "join") {
		bot.join(command[1]);
	} else if (command[0] === "part" || command[0] === "leave" || command[0] === "exit") {
		if (!command[1]) {
			bot.part(action.target, action.nick + " asked me to leave.");
		} else {
			bot.part(command[1], action.nick + " asked me to leave.");
		}
	} else if (command[0] === "say" || command[0] === "echo") {
		const message = command;
		message.shift();
		bot.say(action.target, message.join(" "));
	} else if (command[0] === "demo") {
		handleDemo(bot, action, command[1]);
	}
};

module.exports = {commands};

function handleDemo(bot, action, command) {
	let script = null;

	if (command === "restart") {
		script = ["pm2", "restart", "demo"];
	} else if (command === "update") {
		script = ["bash", "/home/demo/update-demo.sh"];
		bot.say(action.target, "Executing demo update, this may take a while...");
	} else {
		bot.say(action.target, "Supported commands: restart, update");
		return;
	}

	const spawned = spawn(script.shift(), script);
	spawned.stdout.on("data", (data) => console.log(`stdout: ${data}`));
	spawned.stderr.on("data", (data) => console.error(`stderr: ${data}`));
	spawned.on("close", (code) => {
		bot.say(action.target, `Command ${command} exited with code ${code}`);
	});
}
