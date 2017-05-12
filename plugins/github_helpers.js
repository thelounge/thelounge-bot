"use strict";
const {format} = require("util");
const fetch = require("node-fetch");
fetch.Promise = require("bluebird");
const config = require("../config");

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
			.then(res => res.json())
			.then(function(res) {
				if (res.message === "Not Found") {
					return "";
				}

				let type = res.pull_request === undefined ? "Issue" : "PR";
				let status = res.state;
				let title = res.title;
				let link = res.html_url;

				if (type === "PR" && status === "closed") {
					return fetch(res.pull_request.url).then(function(res) {
						return res.json();
					}).then(function(res) {
						if (res.message === "Not Found") {
							return "";
						}

						type = "PR";
						status = res.merged_at === null ? "closed" : "merged";
						title = res.title;
						link = res.html_url;

						return format("[%s %s] (%s) %s (%s)", type, issueNumber, status, title, link);
					});
				}
				return format("[%s %s] (%s) %s (%s)", type, issueNumber, status, title, link);
			});
	} else {
		const url = format("https://api.github.com/repos/%s/%s/commits/%s", user, repo, issueNumber);
		return fetch(url)
			.then(res => res.json())
			.then(function(res) {
				if (res.message === "Not Found") {
					return "";
				}

				let type = "Commit";
				let author = res.commit.author.name;
				let message = res.commit.message;
				let link = res.html_url;
				let add = res.stats.additions;
				let del = res.stats.deletions;

				return format("[%s %s] - %s (add: %s, del: %s) - %s", type, author, message, add, del, link);
			});
	}
}

function searchGithub(options) {

	const {repo = config.githubRepo, user = config.githubUser, terms} = options;
	let status = null;
	const url = `https://api.github.com/search/issues?q=repo:${user}/${repo}+${ terms.join("+") }`;
	return fetch(url)
		.then(res => res.json())
		.then(function(res) {
			if (res.items[0].state) {
				status = res.items[0].state;
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
			return format("[%s %s] (%s) %s (%s)", type, issueNumber, status, title, link);
		});
}

module.exports = {
	getIssueInformation,
	searchGithub,
	stringIsPositiveInteger
};
