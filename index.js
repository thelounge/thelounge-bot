var irc = require("irc");
var fs = require("fs");
var config = require("./config.js");
var jsonfile = require("jsonfile");
var format = require("util").format;
var inspect = require("util").inspect;
var fetch = require("node-fetch");
fetch.Promise = require("bluebird");

require('string.prototype.startswith');

var users;
var karmaUsers;
var karmaFile = config.karmaFile;

var actions = {
    JOIN: "join",
    PART: "part",
    MSG: "msg",
    ERROR: "error",
    INFO: "info"
};

// Probably a better way to do this
(function() {
    jsonfile.readFile(karmaFile, function(err, obj) {
        log(actions.INFO, "Read karmaFile JSON");
        karmaUsers = obj;
    })
})();

var bot = new irc.Client(config.server, config.botName, {
    channels: config.channels
});

bot.addListener("names" + config.channels[0], function(nicks) {
    //Object.keys because node-irc returns nicks as a large object with empty keys...
    users = Object.keys(nicks);
});

bot.addListener("join", function(channel, who) {
    log(actions.JOIN, who + " joined " + channel);
});

bot.addListener("message", function(from, to, text) {
    var splitMessage = text.split(" ");
    var message = "";
    log(actions.MSG, text);

    //It's a command!
    if (splitMessage[0].startsWith(config.commandPrefix)) {
        log(actions.INFO, "Command sent");
        //!karma command
        if (splitMessage[0] == "!karma" && splitMessage.length == 2) {
            userIndex = arrayObjectIndexOf(karmaUsers, splitMessage[1], "name");

            if (userInChannel(splitMessage[1])) {
                message = splitMessage[1] + "'s karma is " + getKarma(splitMessage[1]);
                log(actions.INFO, message)
                bot.say(to, message);
            } else {
                log(actions.ERROR, "No user named " + splitMessage[1] + " found");
            }
            //!gh issue command
        } else if (splitMessage[0] == "!gh") {
            //just !gh
            if (splitMessage.length === 1) {
                message = format("https://github.com/%s/%s", config.githubUser, config.githubRepo);
                //<number> or repo info
            } else if (splitMessage.length === 2) {
                var arg = splitMessage[1];
                //It's a number, so it's an issue
                if (stringIsPositiveInteger(arg)) {
                    message = getIssueInformation({user: config.githubUser, repo: config.githubRepo, issue: arg }).toString();
                } else {
                    var userRepo = parseUserRepoString(arg);
                    mesage = format("https://www.github.com/%s/%s", userRepo.user, userRepo.repo);
                }
            } else if (splitMessage.length === 3) {
                if (stringIsPositiveInteger(splitMessage[2])) {
                    message = getIssueInformation(withIssue(parseUserRepoString(splitMessage[1]), splitMessage[3])).toString();
                } else {
                    message = format("https://github.com/%s/%s", splitMessage[1], splitMessage[2]);
                }
            } else if (splitMessage.length === 4) {
                message = getIssueInformation({user: splitMessage[1], repo: splitMessage[2], issue: splitMessage[3]}).toString();
            }
            bot.say(to, message);
        }
    } else {
        //karma
        if (splitMessage[0].indexOf("++") > -1) {
            //remove ++
            var user = splitMessage[0].toString().slice(0, -2);
            if (userInChannel(user)) {
                incrementKarma(user);
            } else {
                bot.say(to, user + " is not in the channel.");
            }
        }
    }
});

/** Utils **/

var log = function(action, message) {
    console.log("[" + action.toUpperCase() + "]" + " " + message);
}

var userInChannel = function(user) {
    if (users.indexOf(user.toString()) > -1) {
        return true;
    } else {
        return false;
    }
}

var arrayObjectIndexOf = function(array, searchTerm, property) {
    for (var i = 0, len = array.length; i < len; i++) {
        if (array[i][property] === searchTerm) {
            return i;
        }
    }
    return -1;
}

/** Karma **/

var incrementKarma = function(user) {
    var userIndex;
    if (karmaUsers) {
        if (karmaUsers.length >= 1) {
            userIndex = arrayObjectIndexOf(karmaUsers, user, "name");
            log(actions.INFO, "User index is ", userIndex);
        }
        //if the user exists, increment karma, otherwise add them
        if (userIndex > -1) {
            log(actions.INFO, "karmaUser[index]: ", karmaUsers[userIndex]);
            karmaUsers[userIndex].karma = karmaUsers[userIndex].karma + 1;
        } else {
            //they're a new user and just got karma, so it should be 1
            karmaUsers.push({
                "name": user,
                "karma": 1
            });
            log(actions.INFO, "Pushing new user to Karma object");
        }

        //no matter what, we should save the users to a file
        jsonfile.writeFile(karmaFile, karmaUsers);
    }
}

var getKarma = function(user) {
    var userIndex;
    if (karmaUsers) {
        if (karmaUsers.length >= 1) {
            userIndex = arrayObjectIndexOf(karmaUsers, user, "name");
            log(actions.INFO, "User index is ", userIndex);
        }
        if (userIndex > -1) {
            log(actions.INFO, "karmaUser[index]: ", karmaUsers[userIndex]);
            return karmaUsers[userIndex].karma;
        } else {
            return -1;
        }
    }
}

/** Github **/
//Credits to tennu-github for parts of the following.
var getIssueInformation = function(options) {
    var user = options.githubUser;
    var repo = options.githubRepo;
    var issueNumber = options.githubIssue;
    return fetch(format("https://api.github.com/repos/%s/%s/issues/%s", user, repo, issueNumber)).then(function(res) {
            return res.json();
        }).then(function(res) {
            if (res.message === "Not Found") {
                return "Issue does not exist.";
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
                        return "PR does not exist.";
                    }

                    var type = "PR";
                    var status = res.merged_at === null ? "closed" : "merged";
                    var title = res.title;
                    var link = res.html_url;

                    return format("[%s %s] <%s> %s <%s>", type, issueNumber, status, title, link);
                });
            } else {
                return format("[%s %s] <%s> %s <%s>", type, issueNumber, status, title, link);
            }
        });
}

var withIssue = function(obj, issueNumber) {
    obj.issue = issueNumber;
    return obj;
}

var stringIsPositiveInteger = function(string) {
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


var parseUserRepoString = function(userRepoString) {
    if (userRepoString.length === 0) {
        return {
            user: githubUser,
            repo: githubRepo
        };
    }

    if (userRepoString.indexOf("/") === -1) {
        return {
            user: githubUser,
            repo: userRepoString
        };
    }

    var split = userRepoString.split("/");
    var user = split[0].length !== 0 ? split[0] : githubUser;
    var repo = split[1].length !== 0 ? split[1] : githubRepo;

    return {
        user: user,
        repo: repo
    };
}