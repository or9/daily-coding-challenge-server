#!/usr/bin/env node
"use strict";

module.exports = {
	key: "dccs.sess",
	maxAge: 86400000,
	autoCommit: true,
	overwrite: true,
	httpOnly: true,
	signed: true,
	rolling: false,
	renew: false,
};
