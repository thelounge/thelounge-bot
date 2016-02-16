# lounge-bot

A node-js IRC bot for [The Lounge's](https://www.github.com/TheLounge) IRC channel on freenode.


### Setup
```sh
$ npm install
```

### Running
```sh
$ node index.js
```

### Config
Configuration information can be found in the config.json. The default options are below
```js
var config = {
	channels: ["#thelounge"],//The channels to connect to
	server: "chat.freenode.net", //The IRC server
	botName: "lounge-bot", //The bots nick-name
	commandPrefix: "!", //The character used to specify a command
	karmaFile: "karma.json", //The file Karma is stored it
	githubUser: "thelounge", //The default user used in the !gh command
	githubRepo: "lounge" //The default account used in the !gh command
}
```
### TODO
- Modularize (`require()` + `module.exports`)

### Current status
- Karma (<name>++, !karma <user>, !karma)
- Github (!gh, !github)
- Google (!g <query>, !google <query>)
