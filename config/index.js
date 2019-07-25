#!/usr/bin/env node
"use strict";
const { readdirSync } = require("fs");

const { readdirSync } = require("fs");

module.exports = getConfigFilesObj();

function getConfigFilesObj () {
	const configFiles = readdirSync(`${__dirname}`)
		.filter(filename => filename !== "index.js");

	const configFilesObj = configFiles
		.reduce(convertArrayToObject, {});

	return configFilesObj;

	function convertArrayToObject (acc, cur, index) {
		const nameMinusExtension = cur.replace(/\.\w+$/, "");
		acc[nameMinusExtension] = require(`./${nameMinusExtension}`);

		return acc;
	}
}
