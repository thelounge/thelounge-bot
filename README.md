# lounge-bot

A node-js IRC bot for [The Lounge's](https://www.github.com/TheLounge) IRC channel on freenode.


### Setup
```sh
$ npm install
```

### Running
```sh
$ npm run test
$ node index.js
```

### Config
Configuration information can be found in the config.json. The default options are below
```js
var config = {
	channels: ["#thelounge-test"],
	server: "chat.freenode.net",
	botName: "lounge-botter",
	commandPrefix: "!",
	ignore: ["Wendy"],
	githubUser: "thelounge",
	githubRepo: "lounge",
	owners: ["xPaw", "astorije", "YaManicKill", "MaxLeiter"]
}
```
### TODO
- Tests
- Probably manage bans/spam management
- !CSS page search
