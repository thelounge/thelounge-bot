const log = resolve("console.log");
subscribe("bot.message", log);
subscribe("bot.join", log);
