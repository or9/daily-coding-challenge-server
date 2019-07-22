#!/usr/bin/env node
"use strict";

module.exports = userAuthMiddleware;

function userAuthMiddleware () {
	console.log("@userAuthMiddleware@factory");

	return (ctx, next) => {
		console.log("@userAuthMiddleware");
		return next();
	};
}
