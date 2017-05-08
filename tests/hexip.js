"use strict";

const expect = require("chai").expect;
const Helper = require("../util");

describe("HexIP", function() {
	it("should correctly convert IPv4 to hex", function() {
		expect(Helper.ip2Hex("66.124.160.150")).to.equal("427ca096");
		expect(Helper.ip2Hex("127.0.0.1")).to.equal("7f000001");
		expect(Helper.ip2Hex("0.0.0.255")).to.equal("000000ff");
	});
});
