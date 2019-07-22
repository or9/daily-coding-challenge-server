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
const serve = require("koa-static");

// const authorize = require(`${__dirname}/middleware/authorize`);
// const session = require(`${__dirname}/middleware/session`);
const adminAuth = require(`${__dirname}/middleware/adminAuth`);
const userAuth = require(`${__dirname}/middleware/userAuth`);

const __readFile = promisify(readFile);

const staticRouter = new Router();

module.exports = staticRouter;

staticRouter.use(`/admin`, adminAuth());

staticRouter.get(`/:pageTemplate`, pageTemplateRoute);
staticRouter.get(`/admin/:pageTemplate`, adminPageTemplateRoute);
staticRouter.get("/user/:id", userController);

async function pageTemplateRoute (ctx, next) {
	// ctx.params has pageTemplate
	// this.state.title = ctx.params.pageTemplate;
	this.render("default", { title: ctx.params.pageTemplate });
}

async function staticAssetRoute (ctx, next) {
	// ctx.params has assetName
	console.log("ctx state???", ctx.state);
	const filePath = join(`${__dirname}/${ctx.params.assetPath}`)
	// const filePath = join(`${__dirname}/public/index.html`);
	const fstat = await _stat(filePath);

	if (fstat.isFile()) {
		ctx.type = extname(filePath);
		ctx.body = createReadStream(filePath);
	} else {
		ctx.status = 404;
		ctx.body = "Not found";
	}
}

async function adminPageTemplateRoute (ctx, next) {

}

async function userController (ctx, next) {

}
