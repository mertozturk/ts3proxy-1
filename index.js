const app = require('./app');
const http = require('http');
const chalk = require('chalk');
const { exec } = require('child_process');

const host = '0.0.0.0';
const port = 1335;
const httpServer = http.createServer(app);

httpServer.listen(port, host, (err) => {
	if(err) throw err;
	console.log(chalk.green("SUCCESS: ") + `HTTP-Server is running under http://${host}:${port}`);
});
