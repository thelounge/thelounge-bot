const say = resolve("bot.say");
subscribe('bot.join', (channel, who) => {
    if (!who.includes("lounge-user")) { return; }

    say(who, "Hey, " + who + ", now that you've figured out how to use The Lounge, feel free to change your nickname to something more personal using the /nick <new_nickname> command so we know who you are :)");

});
