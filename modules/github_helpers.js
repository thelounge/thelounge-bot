"use strict";
const {format} = require("util");
const fetch = require("node-fetch");
const config = require("../config");
const c = require("irc-colors");

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

			const prefix = res.pull_request === undefined ? "issue" : "pull request";
			const color = res.state === "closed" ? "red" : "green";

			res.state = capitalizeFirstLetter(res.state);

			return `${c.olive("»")} ${c[color](`${res.state} ${prefix}`)} ${c.bold.blue(`#${res.number}`)} - ${res.title} ${res.html_url}`;
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

			return `Commit by ${c.pink(res.commit.author.name)} on ${c.pink(res.commit.author.date)} - ${res.commit.message} ${res.html_url}`;
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

			let status = res.items[0].state;

			if (status === "closed") {
				status = c.red(status);
			} else {
				status = c.green(status);
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

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = {
	getIssueInformation,
	getCommitInformation,
	searchGithub,
};
