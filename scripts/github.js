const TRIGGERS = ["!gh", "!github"];

const searchGithub = resolve("github.searchGithub");
const say = resolve("bot.say");


function parseUserRepoString(string) {
    if (userRepoString.length === 0) {
        return {
            user: config.githubUser,
            repo: config.githubRepo
        };
    }

    if (userRepoString.indexOf("/") === -1) {
        return {
            user: config.githubUser,
            repo: config.userRepoString
        };
    }

    var split = userRepoString.split("/");
    var user = split[0].length !== 0 ? split[0] : config.githubUser;
    var repo = split[1].length !== 0 ? split[1] : config.githubRepo;

    return {
        user: user,
        repo: repo
    }
}

subscribe("bot.message", (from, to, text) => {

    const [trigger, ...split] = text.split(/\s+/);
    if (!TRIGGERS.includes(trigger)) { return; }

    const [command, ...args] = split;

    //just !gh
    /*
    if (!split.length) {
        return say(to, `https://github.com/${githubUser}/${githubRepo}`);
    }
    */

    if (command === "search" && args.length) {

        //The third string is a repo
        if (args[0].includes("/")) {
            const [userRepo, ...terms] = args;
            const { user, repo } = parseUserRepoString(userRepo);

            searchGithub({ repo, user, terms })
                .then(response => say(to, response));
        } else {
            searchGithub({ terms: args })
                .then(response => say(to, response));
        }
    }

    //<number> or repo info
    /*
    if (splitMessage.length === 2 && splitMessage[1] !== "search") {
        //It's a number, so it's an issue or a commit
        if (stringIsPositiveInteger(arg)) {
            log(actions.INFO, config.githubUser);
            message = getIssueInformation({
                user: config.githubUser,
                repo: config.githubRepo,
                issue: arg
            });
            //It's a commit!
        } else if (arg.length === 7 && splitMessage.length === 2 && arg !== "search") {
            log(actions.INFO, "Commit recognized");
            message = getIssueInformation({
                user: config.githubUser,
                repo: config.githubRepo,
                issue: arg
            });
        } else {
            //!gh user/repo
            var userRepo = parseUserRepoString(arg);
            mesage = format("https://www.github.com/%s/%s", userRepo.user, userRepo.repo);
        }
        //!gh search
    } else if (splitMessage.length === 3 && splitMessage[1] !== "search") {
        //search is either an issue or PR
        if (stringIsPositiveInteger(splitMessage[2])) {
            message = getIssueInformation(withIssue(parseUserRepoString(splitMessage[1]), splitMessage[2]));
        } else if (splitMessage[2].length === 7) {
            //Temporary hack to see if it's a commit
            message = getIssueInformation(withIssue(parseUserRepoString(splitMessage[1]), splitMessage[2]));
        } else {
            message = format("https://github.com/%s/%s", splitMessage[1], splitMessage[2]);
        }
    } else if (splitMessage.length === 4 && splitMessage[1] !== "search") {
        message = getIssueInformation({
            user: splitMessage[1],
            repo: splitMessage[2],
            issue: splitMessage[3]
        });
    }
    */
});
