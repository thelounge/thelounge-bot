const fs = require("fs");

var log_debug = function(action) {
	if (debug) {
		log(action);
	}
}

var log = function(text) {
	let message = prettyDate(new Date(Date.now())) + ": " + text + "\n";
	console.log(message);
	fs.appendFile("log.txt", message, function (err) {
		if (err) return console.log(err);
	});
}

var prettyDate = function(date) {
	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
	'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	return months[date.getUTCMonth()] + ' ' + date.getUTCDate() + ', ' + date.getUTCFullYear();
}

module.exports = { log, log_debug, prettyDate };