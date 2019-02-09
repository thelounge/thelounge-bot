"use strict";
const fs = require("fs");

const prettyDate = function(date) {
	const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
		"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

	return months[date.getUTCMonth()] + " " + date.getUTCDate() + ", " + date.getUTCFullYear();
};

const log = function(text) {
	const message = prettyDate(new Date(Date.now())) + ": " + text;

	console.log(message); // eslint-disable-line no-console

	fs.appendFile("log.txt", message, function(err) {
		if (err) {
			return console.log(err); // eslint-disable-line no-console
		}
	});
};

const ip2Hex = function(address) {
	return address.split(".").map(function(octet) {
		let hex = parseInt(octet, 10).toString(16);

		if (hex.length === 1) {
			hex = "0" + hex;
		}

		return hex;
	}).join("");
};

module.exports = {
	log,
	prettyDate,
	ip2Hex,
};
