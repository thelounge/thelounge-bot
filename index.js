"use strict";

const IRC = require("irc-framework");
const config = require("./config.js");
const github = require("./modules/github");
const admin = require("./modules/admin");
const faq = require("./modules/faq");
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

bot.on("registered", function () {
	util.log("Connected!");

	bot.join(config.channels.join(","));

	faq.init();
});

bot.on("socket close", (error) => util.log(`Socket close: ${error}`));
bot.on("socket error", (error) => util.log(`Socket error: ${error}`));
bot.on("irc error", (data) => util.log(data));

bot.on("close", function () {
	util.log("Connection close");
});

bot.on("message", function (event) {
	if (event.from_server) {
		return;
	}

	admin.commands(bot, config, event);
	github.commands(bot, config, event);
	faq.commands(bot, config, event);
});

bot.on("join", function (event) {
	if (event.nick === bot.user.nick) {
		return;
	}

	if (event.nick.startsWith("lounge-user") || event.nick.startsWith("thelounge")) {
		util.log(`${event.nick} joined ${event.channel}, sending welcome message`);
		bot.say(
			event.nick,
			`👋 Hey \x02${event.nick}\x0F, now that you've figured out how to use The Lounge, feel free to change your nickname to something more personal using the \x11/nick <new_nickname>\x0F command so we know who you are! 🙂`
		);
	}

	if (event.channel === "#shout-irc") {
		util.log(`${event.nick} joined ${event.channel}, sending message about shout`);
		bot.say(
			event.nick,
			`👋 Hey \x02${event.nick}\x0F, just a heads up that shout is now inactive, and The Lounge has taken its place. Come join us in #thelounge or check https://thelounge.chat for more info.`
		);
	}
});

bot.on("error", function (event) {
	util.log(`IRC error: ${event.error} (${event.reason})`);
});
