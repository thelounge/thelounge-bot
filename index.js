const IRC = require("irc-framework");
const fs = require("fs");
const config = require("./config.js");
const github = require("./plugins/github");
const admin = require("./plugins/admin")
const debug = true;
var bot = new IRC.Client();

bot.connect({
    host: config.server,
    nick: config.botName
});

bot.on('registered', function() {
    log('Connected!');
    config.channels.forEach(function(e) {
        bot.join(e);
    });
});

bot.on('close', function() {
    log('Connection close');
});

bot.on('message', function(event) {
    if (!event.from_server) {
        log("<" + event.nick + ">" + ": " + event.message);
        if (event.message.indexOf('whois') === 0) {
            bot.whois(event.message.split(' ')[1]);
        }
        admin.commands(bot, config, event);
    }

});

bot.on('join', function(event) {
    log(event.nick + " joined");
    if (event.nick.indexOf("lounge-user") > -1) {
        bot.say(event.nick, "Hey, " + event.nick + ", now that you've figured out how to use The Lounge, feel free to change your nickname to something more personal using the /nick <new_nickname> command so we know who you are :)");
    }
});

bot.on('part', function(event) {
    log(event.channel + ": " + event.nick + " left");
});

var log_debug = function(action) {
    if (debug) {
        log(action);
    }
}

var log = function(text) {
    let message = prettyDate(new Date(Date.now())) + ": " + text + "\n";
    fs.appendFile("log.txt", message, function (err) {
        if (err) return console.log(err);
    });
}

var prettyDate = function(date) {
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return months[date.getUTCMonth()] + ' ' + date.getUTCDate() + ', ' + date.getUTCFullYear();
}

