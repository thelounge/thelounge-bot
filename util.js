"use strict";

function timestamp() {
	return (new Date()).toISOString().split(".")[0].replace("T", " ");
}

const log = function(text) {
	const message = timestamp() + ": " + text;

	console.log(message); // eslint-disable-line no-console
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
	ip2Hex,
};
