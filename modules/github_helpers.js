"use strict";
const {format} = require("util");
const fetch = require("node-fetch");
const config = require("../config");
const c = require("irc-colors");
const relativeDate = require("tiny-relative-date");

function getIssueInformation(options) {
	const {repo = config.githubRepo, user = config.githubUser, issue} = options;
	const url = format("https://api.github.com/repos/%s/%s/issues/%s", user, repo, issue);

	return fetch(url)
		.then((res) => res.json())
		.then((res) => {
			if (res.message === "Not Found") {
				return {};
			}

			if (res.pull_request !== undefined && res.state === "closed") {
				return fetch(res.pull_request.url)
					.then((res2) => res2.json())
					.then((res2) => {
						if (res2.message === "Not Found") {
							return res;
						}

						if (res2.merged_at !== null) {
							res.state = "merged";
						}

						return res;
					});
			}

			return res;
		})
		.then((res) => {
			if (!res.title) {
				return "";
			}

			return c.olive("»") + " " + formatIssue(res);
		});
}

function getCommitInformation(options) {
	const {repo = config.githubRepo, user = config.githubUser, commit} = options;
	const url = format("https://api.github.com/repos/%s/%s/commits/%s", user, repo, commit);

	return fetch(url)
		.then((res) => res.json())
		.then((res) => {
			if (res.message === "Not Found") {
				return "Commit not found.";
			}

			// Take the first line of the commit message and limit its length
			const message = res.commit.message.split("\n")[0].substring(0, 100).trim();
			const date = relativeDate(res.commit.author.date);

			return `Commit by ${c.pink(res.commit.author.name)} on ${c.pink(date)} - ${message} ${res.html_url}`;
		});
}

function searchGithub(options) {
	const {repo = config.githubRepo, user = config.githubUser, terms} = options;
	const url = `https://api.github.com/search/issues?q=repo:${user}/${repo}+${terms.join("+")}`;

	return fetch(url)
		.then((res) => res.json())
		.then(function(res) {
			if (!res.items || res.items.length === 0) {
				return "Nothing was found.";
			}

			return formatIssue(res.items[0]);
		});
}

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatIssue(res) {
	const prefix = res.pull_request === undefined ? "issue" : "pull request";
	const color = res.state === "closed" ? "red" : "green";

	res.state = capitalizeFirstLetter(res.state);

	return `${c[color](`${res.state} ${prefix}`)} ${c.bold.blue(`#${res.number}`)} - ${res.title} ${res.html_url}`;
}

module.exports = {
	getIssueInformation,
	getCommitInformation,
	searchGithub,
};
