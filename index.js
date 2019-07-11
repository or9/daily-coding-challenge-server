const { createSecureServer } = require("http2");
const { 
	readFileSync,
	readFile
} = require("fs");
const { join } = require("path");
const { promisify } = require("util");
const Koa = require("koa");
const morgan = require("koa-morgan");
const Router = require("koa-router");
const serve = require("koa-static");
const hbs = require("koa-hbs");
const rotatingFileStream = require("rotating-file-stream");
const __readFile = promisify(readFile);

const PORT = process.env.PORT || 8443;

const accessLogStream = getLogStream(`access.log`);
const errorLogStream = getLogStream(`error.log`);

const serverOptions = {
	key: readFileSync(`${__dirname}/ssl/selfsigned.key`),
	cert: readFileSync(`${__dirname}/ssl/selfsigned.crt`)
}

const app = new Koa();
const router = new Router();

app.use(hbs.middleware, {
	viewPath: __dirname.concat(`/views`)
});

router.get("/api/hello", (ctx, next, ...args) => {
	// ctx.router available
	ctx.status = 200;
	ctx.body = "hellooo";
});

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
	.use(router.routes())
	.use(router.allowedMethods())
	.use(async (ctx, next) => {
		//return await ctx.send(`${__dirname}/public/index.html`)
		//ctx.body = 
		const doc = await __readFile(`${__dirname}/public/index.html`, `utf-8`);
		ctx.body = doc;
	});

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

