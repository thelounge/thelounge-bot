"use strict";
const fs = require("fs");
const debug = false;

var log_debug = function(action) {
	if (debug) {
		log(action);
	}
};

var log = function(text) {
	let message = prettyDate(new Date(Date.now())) + ": " + text + "\n";
	console.log(message);
	fs.appendFile("log.txt", message, function(err) {
		if (err) {
			return console.log(err);
		}
	});
};

var prettyDate = function(date) {
	const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
		"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

	return months[date.getUTCMonth()] + " " + date.getUTCDate() + ", " + date.getUTCFullYear();
};

var ip2Hex = function(address) {
	return address.split(".").map(function(octet) {
		let hex = parseInt(octet, 10).toString(16);

		if (hex.length === 1) {
			hex = "0" + hex;
		}

		return hex;
	}).join("");
};

var isUrl = function(s) {
	const regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/; // eslint-disable-line no-useless-escape
	return regexp.test(s);
};

module.exports = {log, log_debug, prettyDate, ip2Hex, isUrl};
