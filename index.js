const { createSecureServer } = require("http2");
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
const Koa = require("koa");
const morgan = require("koa-morgan");
const Router = require("koa-router");
const serve = require("koa-static");
const hbs = require("koa-hbs");
const session = require("koa-session");
const passport = require("koa-passport");
const rotatingFileStream = require("rotating-file-stream");
const __readFile = promisify(readFile);

// TODO: remove convert after migration to koa v3
const convert = require('koa-convert');

const PORT = process.env.PORT || 8443;

const accessLogStream = getLogStream(`access.log`);
const errorLogStream = getLogStream(`error.log`);

const serverOptions = {
	key: readFileSync(`${__dirname}/ssl/selfsigned.key`),
	cert: readFileSync(`${__dirname}/ssl/selfsigned.crt`)
}

const app = new Koa();
const apiRouter = new Router();
const staticRouter = new Router();

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
// TODO: convert() is used to avoid deprecation notice for generators in koa v3
app.use(convert(hbs.middleware({
	viewPath: __dirname.concat(`/views`)
})));

app.keys = [
	"daily-coding-challenge-super-secret-0",
	"dccsecret1",
	"dccsecret2"
];

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
	.use(serve(`${__dirname}/public`))
	.use(serve(`${__dirname}/node_modules`))
	.use(apiRouter.routes())
	.use(staticRouter.routes())
	// .use(async (ctx, next) => await ctx.send(`${__dirname}/public/index.html`))
	.use(async (ctx, next) => {
		const filePath = join(`${__dirname}/public/index.html`);
		const fstat = await _stat(filePath);

		if (fstat.isFile()) {
			ctx.type = extname(filePath);
			ctx.body = createReadStream(filePath);
		} else {
			ctx.status = 404;
			ctx.body = "Not found";
		}
	})
	.use(apiRouter.allowedMethods())
	.use(staticRouter.allowedMethods());

console.info(`Starting server @${PORT}`);

createSecureServer(serverOptions, app.callback())
	.listen(PORT);

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

