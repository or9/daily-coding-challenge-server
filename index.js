const Koa = require("koa");
const http2 = require("http2");
const morgan = require("morgan");
const Router = require("router");
const { 
	createWriteStream,
	readFileSync
} = require("fs");
const rotatingFileStream = require("rotating-file-stream");
const { join } = require("path");

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

router.get("/", (ctx, next) => {
	// ctx.router available
});

app
	.use(morgan(`combined`, { stream: accessLogStream }))
	.use(router.routes())
	.use(router.allowedMethods());

app.listen(8443);
