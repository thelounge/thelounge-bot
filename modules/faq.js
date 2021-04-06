"use strict";

const util = require("../util");
const helper = require("./faq_helpers");

let faq = null;

const init = function () {
	faq = helper.getFAQ();
};

const commands = function (bot, options, action) {
	if (action.message.length < 2) {
		return;
	}

	// Only handle FAQ commands in channels to prevent abuse
	if (action.target === bot.user.nick) {
		return;
	}

	if (action.message.startsWith(options.commandPrefix)) {
		const message = action.message.split(" ");
		const cmd = message.shift();

		if (cmd === "!faq") {
			util.log(`[!faq command] ${action.target}: <${action.nick}> ${action.message}`);
			handleFAQCommand(bot, options, action, message);
		} else {
			if (cmd.startsWith("!!")) {
				const shortcut = cmd.substring(2, cmd.length);

				if (!getFAQEntry(shortcut)) {
					return bot.say(action.target, `${action.nick}: ${shortcut} not found.`);
				}

				if (message.length > 0) {
					const filtered = message.filter((text) => text !== "@");
					let targets = filtered.join(" ");
					// remove commas from input so we avoid duplicated on output
					targets = targets.replace(/,/g, "");
					targets = targets.split(" ");
					targets = targets.join(", ");
					// prettify list
					targets = targets.replace(/, ([^,]*)$/, " and $1");
					return bot.say(action.target, `${targets}: ${getFAQEntry(shortcut)}`);
				}

				return bot.say(action.target, `${action.nick}: ${getFAQEntry(shortcut)}`);
			}
		}
	}
};

function handleFAQCommand(bot, options, action, message) {
	const reply = (replyMsg) => bot.say(action.target, `${action.nick}: ${replyMsg}`);

	if (message.length === 0) {
		reply("Available commands: list, add, remove, edit. Use !!<shortcut> to fetch an entry.");
		reply(`Available FAQ entries: ${getPrettyList()}`);
		return;
	}

	const isOwner = options.owners.includes(action.nick);
	const cmd = message.shift();

	if (cmd === "add" && isOwner) {
		handleAddFAQ(message, reply);
	} else if ((cmd === "remove" || cmd === "rm") && isOwner) {
		handleRemoveFAQ(message, cmd, reply);
	} else if (cmd === "edit" && isOwner) {
		handleEditFAQ(message, reply);
	} else if (cmd === "ls" || cmd === "list") {
		return reply(`Available FAQ entries: ${getPrettyList()}`);
	}
}

function handleAddFAQ(message, reply) {
	if (message.length <= 1) {
		return reply("Usage: !faq add <shortcut> <entry>");
	}

	const shortcut = message.shift();

	if (getFAQEntry(shortcut) !== undefined) {
		return reply(
			`${shortcut} already exists. Use !faq edit <shortcut> to modify, or !faq remove <shortcut> to delete.`
		);
	}

	setFAQEntry(shortcut, message);
	return reply(`Successfully added ${shortcut}.`);
}

function handleRemoveFAQ(message, cmd, reply) {
	if (message.length === 0) {
		return reply(`Usage: !faq ${cmd} <shortcut> <entry>`);
	}

	const shortcut = message.shift();

	if (getFAQEntry(shortcut) === undefined) {
		return reply(`${shortcut} doesn't exist. Use !faq list to see available entries.`);
	}

	delete faq[shortcut];
	helper.saveFAQ(faq);
	return reply(`Successfully removed ${shortcut}.`);
}

function handleEditFAQ(message, reply) {
	if (message.length <= 1) {
		return reply("Usage: !faq edit <shortcut> <new entry>");
	}

	const shortcut = message.shift();

	if (getFAQEntry(shortcut) === undefined) {
		return reply(`${shortcut} doesn't exist. Use !faq list to see available entries.`);
	}

	setFAQEntry(shortcut, message);
	return reply(`Successfully updated ${shortcut}.`);
}

function getFAQEntry(shortcut) {
	return faq[shortcut];
}

function setFAQEntry(shortcut, text) {
	if (Array.isArray(text)) {
		faq[shortcut] = text.join(" ");
	} else {
		faq[shortcut] = text;
	}

	helper.saveFAQ(faq);
}

function getPrettyList() {
	const shortcuts = Object.keys(faq);
	const formatted = shortcuts.join(", ").replace(/, ([^,]*)$/, " and $1");
	return formatted;
}

module.exports = {
	commands,
	init,
};
