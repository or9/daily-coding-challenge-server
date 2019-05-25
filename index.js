const { createSecureServer } = require("http2");
const { readFileSync } = require("fs");
const { join } = require("path");
const Koa = require("koa");
const morgan = require("koa-morgan");
const Router = require("koa-router");
const serve = require("koa-static");
const rotatingFileStream = require("rotating-file-stream");

const PORT = process.env.PORT || 8443;

const accessLogStream = getLogStream(`access.log`);
const errorLogStream = getLogStream(`error.log`);

const serverOptions = {
	key: readFileSync(`${__dirname}/ssl/selfsigned.key`),
	cert: readFileSync(`${__dirname}/ssl/selfsigned.crt`)
}

const app = new Koa();
const router = new Router();

router.get("/api/hello", (ctx, next, ...args) => {
	// ctx.router available
	ctx.body = "hellooo";
});

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
	.use(router.routes())
	.use(async (ctx, next) => await ctx.send(`${__dirname}/public/index.html`))
	.use(router.allowedMethods());

console.info(`Starting server @${PORT}`);

createSecureServer(serverOptions, app.callback())
	.listen(PORT);


function getLogStream (outputFilename) {
	return rotatingFileStream(
		outputFilename,
		{ 
			interval: `1d`, //rotate daily
			path: join(__dirname, `log`)
		}
	);	
}

