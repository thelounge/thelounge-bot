"use strict";
const fs = require("fs");
const path = require("path");
const util = require("../util");

function getFAQ() {
	try {
		const data = fs.readFileSync(path.resolve(__dirname, "../data/faq.json"), "utf8");
		util.log("Successfully read faq.json");
		return JSON.parse(data);
	} catch (err) {
		console.error(err);
	}
}

function saveFAQ(faq) {
	try {
		fs.writeFileSync(path.resolve(__dirname, "../data/faq.json"), JSON.stringify(faq), "utf8");
		util.log("Successfully updated faq.json");
	} catch (err) {
		console.error(err);
	}
}

module.exports = {
	getFAQ,
	saveFAQ,
};
