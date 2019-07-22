const { createSecureServer } = require("http2");
const {
	readFileSync,
	stat
} = require("fs");
const { join } = require("path");
const Koa = require("koa");
const morgan = require("koa-morgan");
const serve = require("koa-static");
const koaViews = require("koa-views");
const session = require("koa-session");
const passport = require("koa-passport");
const rotatingFileStream = require("rotating-file-stream");
const config = require("./config");

console.info("Loaded config", config);

const PORT = process.env.PORT || 8443;

const accessLogStream = getLogStream(`access.log`);
const errorLogStream = getLogStream(`error.log`);

const app = new Koa();
const apiRouter = require("./apiRouter");
const staticRouter = require("./staticRouter");

const SESSION_CONFIG = config.session;

// app.use(session(SESSION_CONFIG, app));

apiRouter.use(session(SESSION_CONFIG, app));
staticRouter.use(session(SESSION_CONFIG, app));

// app.use(koaViews(config.koaViews.path, config.koaViews.options));

app.keys = [
	"daily-coding-challenge-super-secret-0",
	"dccsecret1",
	"dccsecret2"
];

console.info(`Starting server`);

app
	.use(session(SESSION_CONFIG, app))
	.use(morgan(`dev`, {
		skip: (req, res) => res.statusCode < 400
	}))
	.use(morgan(`common`, {
		stream: accessLogStream
	}))
	.use(morgan(`combined`, {
		stream: errorLogStream,
		skip: (req, res) => res.statusCode < 400
	}))
	.use(koaViews(config.koaViews.path, config.koaViews.options))
	.use(async (ctx, next) => {
		// ctx.render provided by koaViews middleware
		if (ctx.path === "/") {
			// if root path, don't return index.html
			// return homepage hbs template
			return await ctx.render("default", {
				title: "Home"
			});
		} else {
			// if not the root path, move along
			return next();
		}
	})
	.use(serve(`public`, `${__dirname}/public`))
	.use(serve(`dependency`, `${__dirname}/node_modules`))
	.use(async (ctx, next) => {
		// set ctx.state to set props
		// then
		// ctx.render(templateName);
		// or
		// ctx.render(templateName, { ... })
		// console.log("ctx???", ctx.path);
		if (ctx.path.startsWith("/api")) return next();

		var layoutName = ctx.path
		.replace("/", "")
		.replace("-", " ");

		if (layoutName === "") {
			layoutName = "default";
		}

		return await ctx.render(layoutName, {
			title: "Home"
		});
	})
	.use(apiRouter.routes())
	.use(staticRouter.routes())
	.use(apiRouter.allowedMethods())
	.use(staticRouter.allowedMethods());

createSecureServer(config.server, app.callback())
	.listen(PORT, () => {
		console.info("Server started at :%s", PORT);
	});

function getLogStream (outputFilename) {
	return rotatingFileStream(
		outputFilename,
		{
			interval: `1d`, //rotate daily
			path: join(__dirname, `log`)
		}
	);
}

