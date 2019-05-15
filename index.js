const { createSecureServer } = require("http2");
const { readFileSync } = require("fs");
const { join } = require("path");
const Koa = require("koa");
const logger = require("koa-logger");
const Router = require("koa-router");
const rotatingFileStream = require("rotating-file-stream");

const PORT = process.env.PORT || 8443;

const accessLogStream = rotatingFileStream(
	`access.log`,
	{ 
		interval: `1d`, //rotate daily
		path: join(__dirname, `log`)
	}
);

const serverOptions = {
	key: readFileSync(`${__dirname}/ssl/selfsigned.key`),
	cert: readFileSync(`${__dirname}/ssl/selfsigned.crt`)
}

const app = new Koa();
const router = new Router();

router.get("/", (ctx, next, ...args) => {
	console.log("#get /");
	// ctx.router available
	ctx.body = "hellooo";
});

app
	.use(logger({
		transporter: (str, args) => {
			if (args.status < 400) {
				process.stdout.write(str);
			} else {
				process.stderr.write(str);
			}
			process.stdout.write(`\n`);
			
			accessLogStream.write(str);
			accessLogStream.write(`\n`);
		}
	}))
	.use(router.routes())
	.use(router.allowedMethods());

createSecureServer(serverOptions, app.callback())
	.listen(PORT);



