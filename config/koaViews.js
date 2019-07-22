#!/usr/bin/env node
"use strict";
const { readdirSync } = require("fs");

module.exports = {
	path: `${__dirname}/../views`,
	options: {
		extension: "hbs",
		map: {
			hbs: "handlebars"
		},
		options: {
			// helperDirs: `${__dirname}/views/helpers`,
			// convert array of filenames to list of filenames
			partials: getPartialsFiles(),
			// partials: {
			// 	subTitle: `./subTitle`
			// },
			// helpers: {
			// 	uppercase: str => str.toUpperCase(),
			// }
			// cache: true // cache the template string or not
		}
	}
};

function getPartialsFiles () {
	const PARTIALS_FILES_DIR = process.env.PARTIALS_FILES_DIR ||
		`${__dirname}/../views/partials`;
	const partialsFiles = readdirSync(PARTIALS_FILES_DIR);
	const partialsFilesList = partialsFiles.reduce(convertArrayToObject, {});

	console.info("Loaded partials", partialsFilesList);

	return partialsFilesList;

	function convertArrayToObject (acc, cur, index) {
		const nameMinusExtension = cur.replace(/\.\w+$/, "");
		const filepath = PARTIALS_FILES_DIR.concat(`/`, nameMinusExtension);
		acc[nameMinusExtension] = filepath;

		return acc;
	}
}
