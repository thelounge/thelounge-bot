const { format } = require("util");
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
    const { repo = config.githubRepo, user = config.githubUser, issue } = options;
    var issueNumber = issue;
    console.log(issueNumber);
    if (stringIsPositiveInteger(issueNumber.toString())) {
        const url = format("https://api.github.com/repos/%s/%s/issues/%s", user, repo, issueNumber);
        return fetch(url)
            .then(res => res.json())
            .then(function(res) {
                if (res.message === "Not Found") {
                    return "";
                }

                var type = res.pull_request === undefined ? "Issue" : "PR";
                var status = res.state;
                var title = res.title;
                var link = res.html_url;

                if (type === "PR" && status === "closed") {
                    return fetch(res.pull_request.url).then(function(res) {
                        return res.json();
                    }).then(function(res) {
                        if (res.message === "Not Found") {
                            return "";
                        }

                        var type = "PR";
                        var status = res.merged_at === null ? "closed" : "merged";
                        var title = res.title;
                        var link = res.html_url;

                        return format("[%s %s] (%s) %s (%s)", type, issueNumber, status, title, link);
                    });
                } else {
                    return format("[%s %s] (%s) %s (%s)", type, issueNumber, status, title, link);
                }
            });
    } else {

        const url = format("https://api.github.com/repos/%s/%s/commits/%s", user, repo, issueNumber);
        return fetch(url)
            .then(res => res.json())
            .then(function(res) {
                if (res.message === "Not Found") {
                    return "";
                }

                var type = "Commit";
                var author = res.commit.author.name;
                var message = res.commit.message;
                var link = res.html_url;
                var add = res.stats.additions;
                var del = res.stats.deletions;

                return format("[%s %s] - %s (add: %s, del: %s) - %s", type, author, message, add, del, link);
            });
    }
}

function searchGithub(options) {
    const { repo = config.githubRepo, user = config.githubUser, terms } = options;
    const url = `https://api.github.com/search/issues?q=repo:${user}/${repo}+${ terms.join("+") }`;
    return fetch(url)
        .then(res => res.json())
        .then(function(res) {
            if (res.items[0].state) {
                var status = res.items[0].state;
            } else {
                return "No issue found";
            }
            var title = res.items[0].title;
            var link = res.items[0].html_url;
            var issueNumber = res.items[0].number;
            var type = "";
            if(link.indexOf("issues") > -1) {
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