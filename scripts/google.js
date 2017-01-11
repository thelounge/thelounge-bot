const google = resolve("google");
const say = resolve("bot.say");

const TRIGGERS = ["!g", "!google"];

subscribe("bot.message", (from, to, text) => {
    const [trigger, ...args] = text.split(/\s+/);

    if (!TRIGGERS.includes(trigger) || !args.length) { return; }

    const query = args.join(" ");
    google(query, function(err, next, links) {
        if (err) {
            log(actions.ERROR, err);
        }
        const [link] = links;

        say(to, `${ link.title } ${ link.link }`);
    });
});
