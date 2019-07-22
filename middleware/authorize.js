#!/usr/bin/env node
"use strict";

module.exports = authorizeMiddleware;

function authorizeMiddleware (ctx, next) {
	console.log("@authorizeMiddleware");
	return next();
}
