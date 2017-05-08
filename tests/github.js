const helper = require("../plugins/github_helpers");
const expect = require("chai").expect;

describe("stringIsPositiveInteger", function() {
	it("should return false on NaN", function() {
		expect(helper.stringIsPositiveInteger("abc")).to.equal(false);
	});
	it("should return false on a negative number", function() {
		expect(helper.stringIsPositiveInteger(-1)).to.equal(false);
	});
	it("should return true on a positive integer", function() {
		expect(helper.stringIsPositiveInteger(1)).to.equal(true);
	});
});