"use strict";
const helper = require("./github_helpers");
const URL = require("url-parse");
const util = require("../util");

var commands = function(bot, options, action) {
	let message = action.message.split(" ");
	let query;
	if (message.length < 1) {
		return;
	}

	let urls = [];
	for (let x in message) {
		if (util.isUrl(x)) {
			urls.push(x);
		}
	}

	for (var i = 0; i < urls.length; i++) {
		let link = URL(urls[i]);
		if (!(link.hostname === "www.github.com" || link.hostname === "github.com")) {
			continue;
		} else { // is a github link
			const beginning = `/${options.githubUser}/${options.githubRepo}/`;
			if (link.pathname.startsWith(beginning)) { // i.e. /thelounge/lounge/
				let id = link.pathname.substring(beginning.length); // "pulls/5" || "issue/5"
				if (id.startsWith("pulls")) {
					id = id.substring(5);
				} else if (id.startsWith("issues")) {
					id = id.substring(6);
				} else {
					break;
				}

				const query = helper.getIssueInformation({
					user: options.githubUser,
					repo: options.githubRepo,
					issue: id
				});

				if (query) {
					if (typeof query.then === "function") {
						query.then(function(m) {
							return bot.say(action.target, m);
						});
					} else {
						bot.say(action.target, query);
					}
				}
			}
		}
	}

	if (action.message.startsWith(options.commandPrefix) || action.message.startsWith(options.botName)) {
		if (message[0] === "!github" || message[0] === "!gh") {
			message.shift(); // remove the command
			const arg = message[0];
			if (message.length === 1) {
				if (helper.stringIsPositiveInteger(arg)) {
					query = helper.getIssueInformation({
						user: options.githubUser,
						repo: options.githubRepo,
						issue: arg
					});
				} else {
					if (arg === "search") {
						query = "Search query cannot be empty";
					} else {
						query = action.nick + ": invalid issue/PR ID";
					}
				}
			} else if (message.length >= 2) { // should be !gh search <query>
				if (arg === "search") {
					message.shift(); // remove 'search'
					query = helper.searchGithub({
						repo: options.githubRepo,
						user: options.githubUser,
						terms: message
					});
				} else {
					query = action.nick + ": invalid command.";
				}
			}
			if (query) {
				// if it's returned as a Promise
				if (typeof query.then === "function") {
					query.then(function(m) {
						return bot.say(action.target, m);
					});
				} else {
					bot.say(action.target, query);
				}
			} else {
				bot.say(action.target, "No result found for query");
			}
		}
	}
	if (action.message.indexOf("#") > -1 && options.ignore.indexOf(action.nick) === -1) { // if the message contains # and isn't an ignored user
		let issues = action.message.match(/#([0-9]*)/g);
		if (issues) {
			issues.forEach(function(issue) {
				let issueNumber = issue.substr(1);
				query = helper.getIssueInformation({
					user: options.githubUser,
					repo: options.githubRepo,
					issue: issueNumber
				});
				query.then(function(m) {
					return bot.say(action.target, m);
				});
			});
		}
	}
};

module.exports = {
	commands
};
