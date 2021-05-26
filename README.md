# lounge-bot

A node-js IRC bot for [The Lounge's](https://www.github.com/TheLounge) IRC channel on Libera.Chat.

### Setup and running

```sh
$ yarn
$ yarn test
$ yarn start
```

### Config

Configuration information can be found in the config.json. The default options are below

```js
var config = {
  channels: ["#thelounge-test"],
  server: "irc.libera.chat",
  botName: "lounge-botter",
  realName: "TheLounge IRC Bot",
  commandPrefix: "!",
  ignore: ["Wendy"],
  githubUser: "thelounge",
  githubRepo: "lounge",
  owners: ["xPaw", "astorije", "YaManicKill", "MaxLeiter"],
};
```
