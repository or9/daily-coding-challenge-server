const { createSecureServer } = require("http2");
const {
	readFileSync,
	readdirSync,
	readFile,
	stat,
	createReadStream,
} = require("fs");
const {
	join,
	extname
} = require("path");
const { promisify } = require("util");
const Koa = require("koa");
const morgan = require("koa-morgan");
const Router = require("koa-router");
const serve = require("koa-static");
const koaViews = require("koa-views");
// const koaHbs = require("koa-views-handlebars");
const session = require("koa-session");
const passport = require("koa-passport");
const rotatingFileStream = require("rotating-file-stream");
const config = require("./config");

// const __readFile = promisify(readFile);

// TODO: remove convert after migration to koa v3
// const convert = require('koa-convert');

const PORT = process.env.PORT || 8443;

const accessLogStream = getLogStream(`access.log`);
const errorLogStream = getLogStream(`error.log`);

const serverOptions = {
	key: readFileSync(`${__dirname}/ssl/selfsigned.key`),
	cert: readFileSync(`${__dirname}/ssl/selfsigned.crt`)
}

const app = new Koa();
const apiRouter = require("./apiRouter");
const staticRouter = require("./staticRouter");
// const apiRouter = new Router();
// const staticRouter = new Router();

// const HANDLEBARS_CONFIG = {
// 	viewPath: __dirname.concat(`/views`),
// 	partialsPath: __dirname.concat(`/views/partials`),
// 	// defaultLayout: "default",
// };

const SESSION_CONFIG = {
	key: "dccs.sess",
	maxAge: 86400000,
	autoCommit: true,
	overwrite: true,
	httpOnly: true,
	signed: true,
	rolling: false,
	renew: false,
};

app.use(session(SESSION_CONFIG, app));

apiRouter.use(session(SESSION_CONFIG, app));
staticRouter.use(session(SESSION_CONFIG, app));
// TODO: convert() is used to avoid deprecation notice for generators in koa v3
// app.use(convert(hbs.middleware(HANDLEBARS_CONFIG)));
// app.use(hbs.middleware(HANDLEBARS_CONFIG));

console.log("partials files list?", getPartialsFiles());

app.use(koaViews(config.koaViews.path, config.koaViews.options));

app.keys = [
	"daily-coding-challenge-super-secret-0",
	"dccsecret1",
	"dccsecret2"
];

console.info(`Starting server`);

app
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
	.use(serve(`public`, `${__dirname}/public`))
	.use(serve(`dependency`, `${__dirname}/node_modules`))
	.use(async function (ctx, next) {
		// set ctx.state to set props
		// then
		// ctx.render(templateName);
		// or
		// ctx.render(templateName, { ... })
		console.log("ctx???", ctx.path);
		if (ctx.path.startsWith("/api")) return next();

		var layoutName = ctx.path
		.replace("/", "")
		.replace("-", " ");

		if (layoutName === "") {
			layoutName = "default";
		}

		return await ctx.render(layoutName, {
			title: "mainnnnn"
		});
	})
	.use(apiRouter.routes())
	.use(staticRouter.routes())
	.use(apiRouter.allowedMethods())
	.use(staticRouter.allowedMethods());

createSecureServer(serverOptions, app.callback())
	.listen(PORT, () => {
		console.info("server started at :%s", PORT);
	});

function _stat (path) {
	return new Promise((resolve, reject) => {
		stat(path, (err, res) => {
			if (err) return reject(err);
			else return resolve(res);
		});
	});
}


function getLogStream (outputFilename) {
	return rotatingFileStream(
		outputFilename,
		{
			interval: `1d`, //rotate daily
			path: join(__dirname, `log`)
		}
	);
}

