const Koa = require("koa");
// TODO: delete morgan. It's not good.
//const morgan = require("morgan");
const logger = require("koa-logger");
const Router = require("koa-router");
const { createSecureServer } = require("http2");
const {
	createWriteStream,
	readFileSync
} = require("fs");
const { join } = require("path");
const rotatingFileStream = require("rotating-file-stream");
const PORT = process.env.PORT || 8443;

const accessLogStream = rotatingFileStream(
	`access.log`,
	{ 
		interval: `1d`, //rotate daily
		path: join(__dirname, `log`)
	}
);
//const accessLogStream = createWriteStream(join(__dirname, "access.log"), { flags: "a" });

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

// transporter: (str, args) => {
// str {string} string with ansi colors
// args {array} [format, method, url, status, time, length]


app
	//.use(morgan(`combined`, { 
	//	stream: accessLogStream,
	//	skip: (req, res) => res.statusCode < 400
	//}))
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

console.info(`App starting on ${PORT}`);

createSecureServer(serverOptions, app.callback())
	.listen(PORT);



