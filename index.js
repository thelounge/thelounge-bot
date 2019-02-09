"use strict";

const IRC = require("irc-framework");
const config = require("./config.js");
const github = require("./modules/github");
const admin = require("./modules/admin");
const util = require("./util");
const ip = require("ip");
const bot = new IRC.Client();

bot.connect({
	host: config.server,
	port: config.server_port,
	tls: config.server_tls,
	nick: config.botName,
	gecos: config.realName,
	username: util.ip2Hex(ip.address()),
	password: config.password,
});

bot.on("registered", function() {
	util.log("Connected!");

	bot.join(config.channels.join(","));
});

bot.on("close", function() {
	util.log("Connection close");
});

bot.on("message", function(event) {
	if (event.from_server) {
		return;
	}

	util.log(event.target + ": " + "<" + event.nick + ">" + ": " + event.message);

	admin.commands(bot, config, event);
	github.commands(bot, config, event);
});

bot.on("join", function(event) {
	util.log(`${event.nick} joined ${event.channel}`);

	if (event.nick === bot.user.nick) {
		return;
	}

	if (event.nick.startsWith("lounge-user") || event.nick.startsWith("thelounge")) {
		bot.say(event.nick, `👋 Hey \x02${event.nick}\x0F, now that you've figured out how to use The Lounge, feel free to change your nickname to something more personal using the \x11/nick <new_nickname>\x0F command so we know who you are! 🙂`);
	}

	if (event.channel === "#shout-irc") {
		bot.say(event.nick, `👋 Hey \x02${event.nick}\x0F, just a heads up that shout is now inactive, and The Lounge has taken its place. Come join us in #thelounge or check https://thelounge.chat for more info.`);
	}
});

bot.on("part", function(event) {
	util.log(event.channel + ": " + event.nick + " left");
});
