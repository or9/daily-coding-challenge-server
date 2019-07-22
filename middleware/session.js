#!/usr/bin/env node
"use strict";

module.exports = sessionMiddleware;

function sessionMiddleware (ctx, next) {
	console.log("@sessionMiddleware");
	return next();
}
