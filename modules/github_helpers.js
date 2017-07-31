"use strict";
const {format} = require("util");
const fetch = require("node-fetch");
fetch.Promise = require("bluebird");
const config = require("../config");
const c = require("irc-colors");

function stringIsPositiveInteger(string) {
	var number = Number(string);

	if (isNaN(number)) {
		return false;
	}

	if (number === Infinity) {
		return false;
	}

	if (number < 1) {
		return false;
	}

	if (Math.floor(number) !== number) {
		return false;
	}

	return true;
}

function getIssueInformation(options) {
	const {repo = config.githubRepo, user = config.githubUser, issue} = options;
	const issueNumber = issue;
	if (stringIsPositiveInteger(issueNumber.toString())) {
		const url = format("https://api.github.com/repos/%s/%s/issues/%s", user, repo, issueNumber);
		return fetch(url)
			.then((res) => res.json())
			.then(function(res) {
				if (res.message === "Not Found") {
					return "";
				}

				let type = res.pull_request === undefined ? "Issue" : "PR";
				let status = res.state;
				let title = res.title;
				let link = res.html_url;

				if (type === "PR" && status === "closed") {
					return fetch(res.pull_request.url)
						.then((res2) => res2.json())
						.then((res3) => {
							if (res3.message === "Not Found") {
								return "";
							}

							type = "PR";
							status = res3.merged_at === null ? c.red("closed") : c.green("merged");
							title = res3.title;
							link = res3.html_url;

							return format("[%s %s] (%s) %s (%s)", c.bold.pink(type), c.bold.pink(issueNumber), status, title, link);
						});
				}

				return format("[%s %s] (%s) %s (%s)", c.bold.pink(type), c.bold.pink(issueNumber), status, title, link);
			});
	}
	const url = format("https://api.github.com/repos/%s/%s/commits/%s", user, repo, issueNumber);
	return fetch(url)
		.then((res) => res.json())
		.then(function(res) {
			if (res.message === "Not Found") {
				return "";
			}

			const type = "Commit";
			const author = res.commit.author.name;
			const message = res.commit.message;
			const link = res.html_url;
			const add = res.stats.additions;
			const del = res.stats.deletions;

			return format("[%s %s] - %s (add: %s, del: %s) - %s", c.bold.pink(type), author, message, add, del, link);
		});
}

function searchGithub(options) {
	const {repo = config.githubRepo, user = config.githubUser, terms} = options;
	let status = null;
	const url = `https://api.github.com/search/issues?q=repo:${user}/${repo}+${terms.join("+")}`;
	return fetch(url)
		.then((res) => res.json())
		.then(function(res) {
			if (res.items[0].state) {
				status = res.items[0].state;
				if (status === "closed") {
					status = c.red(status);
				} else {
					status = c.green(status);
				}
			} else {
				return "No issue found";
			}
			const title = res.items[0].title;
			const link = res.items[0].html_url;
			const issueNumber = res.items[0].number;
			let type = "";
			if (link.indexOf("issues") > -1) {
				type = "Issue";
			} else {
				type = "PR";
			}
			return format("[%s %s] (%s) %s (%s)", c.bold.pink(type), c.bold.pink(issueNumber), status, title, link);
		});
}

module.exports = {
	getIssueInformation,
	searchGithub,
	stringIsPositiveInteger
};
