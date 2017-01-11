const fs = require("fs");

const irc = require("irc");

const google = require("google");
google.resultsPerPage = 1;


const scriptcontext = require("scriptcontext");

const config = require("./config.js");


const path = require("path");
const watch = require("watch");

let context;

watch.createMonitor(
    path.resolve(__dirname, "scripts"),
    { ignoreDotFiles: true },
    monitor => {

        const rebuildContext = () => {
            if (context) { context.destroy(); }

            const filePaths = Object.keys(monitor.files)
                .filter(filePath => /\.js$/.test(filePath));

            const scripts = filePaths.map(filePath => ({
                file: path.basename(filePath),
                content: fs.readFileSync(filePath)
            }));

            const provide = {
                resolve: {
                    bot: {
                        say: (...args) => bot.say(...args)
                    },
                    github: require("./lib/github"),
                    google,
                    //readConfig: (key) => JSON.parse(JSON.stringify(config[key]))
                    console: {
                        log: (...args) => console.log(...args)
                    }
                },
                subscribe: { bot }
            };

            context = scriptcontext(provide, scripts);

            console.log(context.scriptResult);
        };

        monitor.on("created", rebuildContext);
        monitor.on("changed", rebuildContext);
        monitor.on("removed", rebuildContext);

        const { server, botName, channels } = config;
        const bot = new irc.Client(server, botName, { channels });

        rebuildContext();
    }
);
