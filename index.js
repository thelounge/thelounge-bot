var irc = require("irc");
var fs = require("fs");
var config = require("./config.js");
var jsonfile = require("jsonfile");
require('string.prototype.startswith');

var users;
var karmaUsers;
var karmaFile = "karma.json";

var actions = {
	JOIN : "join",
	PART : "part",
	MSG : "msg",
	ERROR : "error",
	INFO : "info"
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
	log(actions.MSG, text);

	//It's a command!
	if(splitMessage[0].startsWith(config.commandPrefix)) {
		log(actions.INFO, "Command sent");
		if(splitMessage[0] == "!karma" && splitMessage.length == 2) {
			userIndex = arrayObjectIndexOf(karmaUsers, splitMessage[1], "name");

			if(userInChannel(splitMessage[1])) {
				var message = splitMessage[1] + "'s karma is " + getKarma(splitMessage[1]);
				log(actions.INFO, message)
				bot.say(to, message);
			} else {
				log(actions.ERROR, "No user named " + splitMessage[1] + " found");
			}
		}
	} else {
		/** karma **/
		if(splitMessage[0].indexOf("++") > -1) {
			//remove ++
			var user = splitMessage[0].toString().slice(0, -2);
			if(userInChannel(user)) {
				incrementKarma(user);
			} else {
				bot.say(to, user + " is not in the channel.");
			}
		}
	}

});

var log = function(action, message) {
	console.log("[" + action.toUpperCase() + "]" + " " + message);
}

var userInChannel = function(user) {
	if(users.indexOf(user.toString()) > -1) {
		return true;
	} else {
		return false;
	}
}

var arrayObjectIndexOf = function(array, searchTerm, property) {
	for(var i = 0, len = array.length; i < len; i++) {
		if (array[i][property] === searchTerm) {
			return i;
		}
	}
	return -1;
}

/** Karma **/

var incrementKarma = function(user) {
	var userIndex;
	if(karmaUsers) {
		if(karmaUsers.length >= 1) {
			userIndex = arrayObjectIndexOf(karmaUsers, user, "name");
			log(actions.INFO, "User index is ", userIndex);
		}
		//if the user exists, increment karma, otherwise add them
		if(userIndex > -1) {
			log(actions.INFO, "karmaUser[index]: ", karmaUsers[userIndex]);
			karmaUsers[userIndex].karma = karmaUsers[userIndex].karma + 1;
		} else {
			//they're a new user and just got karma, so it should be 1
			karmaUsers.push({"name": user, "karma": 1});
			log(actions.INFO, "Pushing new user to Karma object");
		}

		//no matter what, we should save the users to a file
		jsonfile.writeFile(karmaFile, karmaUsers);
	}
}

var getKarma = function(user) {
	var userIndex;
	if(karmaUsers) {
		if(karmaUsers.length >= 1) {
			userIndex = arrayObjectIndexOf(karmaUsers, user, "name");
			log(actions.INFO, "User index is ", userIndex);
		}
		if(userIndex > -1) {
			log(actions.INFO, "karmaUser[index]: ", karmaUsers[userIndex]);
			return karmaUsers[userIndex].karma;
		} else {
			return -1;
		}	
	}
}
