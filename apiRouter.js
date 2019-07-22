#!/usr/bin/env node
"use strict";

const {
	readFileSync,
	readFile,
	stat,
	createReadStream,
} = require("fs");
const {
	join,
	extname
} = require("path");
const { promisify } = require("util");
const Router = require("koa-router");

const __readFile = promisify(readFile);
// const authorize = require(`${__dirname}/middleware/authorize`);
// const session = require(`${__dirname}/middleware/session`);
const adminAuth = require(`${__dirname}/middleware/adminAuth`);
const userAuth = require(`${__dirname}/middleware/userAuth`);

const apiRouter = new Router();

module.exports = apiRouter;

apiRouter.use(`/api`, userAuth());
apiRouter.use(`/api/admin`, adminAuth());

apiRouter.post(`/api/login`, loginRouteHandler);
apiRouter.get("/api/hello", pingRouteHandler);

function loginRouteHandler (ctx, next, ...args) {
	ctx.status = 200;
	ctx.body = "OK";
}

function pingRouteHandler (ctx, next, ...args) {
	console.log("hellooooooooo");
	// ctx.router available
	ctx.status = 200;
	ctx.body = "hellooo";
}
