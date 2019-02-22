const app = require('./app');
const http = require('http');
const chalk = require('chalk');
const config = require('./config.json');

const host = config.webserver.host;
const port = config.webserver.port;
const httpServer = http.createServer(app);

if(config.private.enabled && config.private.password == "admin") {
	console.error("PRIVATE MODE WITHOUT CHANGING THE DEFAULT PASSWORD IS UNSECURE! CHANGE THE PASSWORD!");
	process.exit(1);
}

httpServer.listen(port, host, (err) => {
	if(err) throw err;
	console.log(chalk.green("SUCCESS: ") + `HTTP-Server is running under http://${host}:${port}`);
});
