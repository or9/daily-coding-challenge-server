#!/usr/bin/env node
"use strict";

module.exports = adminAuthMiddleware;

function adminAuthMiddleware (ctx, next) {
	console.log("@adminAuthMiddleware@factory");

	return (ctx, next) => {
		console.log("@adminAuthMiddleware");
		return next();
	};
}
