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
	nick: config.botName,
	gecos: config.realName,
	username: util.ip2Hex(ip.address()),
	password: config.password,
	auto_reconnect: true,
	auto_reconnect_wait: 4000,
	auto_reconnect_max_retries: 3,
	ping_interval: 30,
	ping_timeout: 120,
});

bot.on("registered", function() {
	util.log("Connected!");
	config.channels.forEach(function(e) {
		bot.join(e);
	});
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
	util.log(event.nick + " joined");

	if (event.nick.startsWith("lounge-user") || event.nick.startsWith("thelounge")) {
		bot.say(event.nick, `👋 Hey \x02${event.nick}\x0F, now that you've figured out how to use The Lounge, feel free to change your nickname to something more personal using the \x11/nick <new_nickname>\x0F command so we know who you are! 🙂`);
	}
});

bot.on("part", function(event) {
	util.log(event.channel + ": " + event.nick + " left");
});
