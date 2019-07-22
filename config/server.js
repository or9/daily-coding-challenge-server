#!/usr/bin/env node
"use strict";

const { readFileSync } = require("fs");

module.exports = {
	key: readFileSync(`${__dirname}/../ssl/selfsigned.key`),
	cert: readFileSync(`${__dirname}/../ssl/selfsigned.crt`)
};
