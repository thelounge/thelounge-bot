const getIssueInformation = resolve("github.getIssueInformation");

const say = resolve("bot.say");

subscribe("bot.message", (from, to, text) => {

    if (text.startsWith("!")) { return; }

    const issues = text.match(/#(\d+)/g);
    if (!issues) { return; }

    issues.forEach(function (issue) {

        resolve("console.log")(`issue ${issue}`);

        var issueNumber = Number(issue.slice(1));

        getIssueInformation({
            issue: issueNumber
        }).then(function(m) {
            return say(to, m);
        });
    });

});
