"use strict";

const helper = require("./github_helpers");
const util = require("../util");
const issueNumbersRegex = /\B#([0-9]+)\b/g;

const commands = function(bot, options, action) {
	if (action.message.length < 2) {
		return;
	}

	// Only handle github commands in channels to prevent abuse
	if (action.target === bot.user.nick) {
		return;
	}

	if (action.message.startsWith(options.commandPrefix)) {
		const message = action.message.split(" ");
		const cmd = message.shift();

		if (cmd === "!github" || cmd === "!gh") {
			util.log(`[!gh command] ${action.target}: <${action.nick}> ${action.message}`);
			handleSearchCommand(bot, options, action, message);
		}
	}

	// if the message contains # and isn't an ignored user
	if (action.message.includes("#") && !options.ignore.includes(action.nick)) {
		util.log(`[issue number] ${action.target}: <${action.nick}> ${action.message}`);
		handleIssueNumber(bot, options, action);
	}
};

function handleSearchCommand(bot, options, action, message) {
	const reply = (replyMsg) => bot.say(action.target, `${action.nick}: ${replyMsg}`);

	if (message.length === 0) {
		return reply("Usage: !gh search <query> or !gh <commit>");
	}

	const cmd = message.shift();

	if (cmd === "search") {
		if (message.length === 0) {
			return reply("Search query cannot be empty.");
		}

		return helper.searchGithub({
			repo: options.githubRepo,
			user: options.githubUser,
			terms: message,
		}).then(reply);
	}

	helper.getCommitInformation({
		user: options.githubUser,
		repo: options.githubRepo,
		commit: cmd,
	}).then(reply);
}

function handleIssueNumber(bot, options, action) {
	const issues = action.message.match(issueNumbersRegex);

	if (issues) {
		issues.slice(0, 3).forEach((issue) => {
			const issueNumber = issue.substr(1);

			helper.getIssueInformation({
				user: options.githubUser,
				repo: options.githubRepo,
				issue: issueNumber,
			}).then((message) => {
				if (message) {
					bot.say(action.target, message);
				}
			});
		});
	}
}

module.exports = {
	commands,
};
