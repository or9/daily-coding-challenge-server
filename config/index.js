#!/usr/bin/env node
"use strict";

const { readdirSync } = require("fs");

module.exports = getConfigFilesObj();

function getConfigFilesObj () {
	const configFiles = readdirSync("./").filter(filename => filename !== "index.js");
	const configFilesList = configFiles.reduce(convertArrayToObject, {});

	return configFilesObj;

	function convertArrayToObject (acc, cur, index) {
		const nameMinusExtension = cur.replace(/\.\w+$/, "");
		const filepath = PARTIALS_FILES_DIR.concat(`/`, nameMinusExtension);
		acc[nameMinusExtension] = require(`./${filepath}`);

		return acc;
	}
}
