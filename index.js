"use strict";
const IRC = require("irc-framework");
const config = require("./config.js");
const github = require("./plugins/github");
const admin = require("./plugins/admin");
const lounge = require("./plugins/lounge");
const util = require("./util");
const ip = require("ip");
var bot = new IRC.Client();

bot.connect({
	host: config.server,
	nick: config.botName,
	gecos: config.realName,
	username: util.ip2Hex(ip.address()),
	auto_reconnect: true,
	auto_reconnect_wait: 4000,
	auto_reconnect_max_retries: 3,
	ping_interval: 30,
	ping_timeout: 120
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
	if (!event.from_server) {
		util.log("<" + event.nick + ">" + ": " + event.message);
		if (event.message.indexOf("whois") === 0) {
			bot.whois(event.message.split(" ")[1]);
		}
		admin.commands(bot, config, event);
		github.commands(bot, config, event);
		lounge.commands(bot, config, event);
	}
});

bot.on("join", function(event) {
	util.log(event.nick + " joined");
	if (event.nick.indexOf("lounge-user") > -1) {
		bot.say(event.nick, "Hey, " + event.nick + ", now that you've figured out how to use The Lounge, feel free to change your nickname to something more personal using the /nick <new_nickname> command so we know who you are :)");
	}
});

bot.on("part", function(event) {
	util.log(event.channel + ": " + event.nick + " left");
});

