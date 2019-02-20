const fs = require('fs');
const express = require('express');
const config = require('../config.json');

const router = express.Router();

router.get('/', (req, res) => {
	res.status(200).render("index");
});

router.post('/', (req, res) => {
	if(!req.body.ip) {
		return res.status(200).render("index");
	}

	function getIPFromInput(input, cb) {
		const dns = require('dns');
		const isIp = require('is-ip');

		let address = input;
		let port = 9987;
		let customport = false;
		if(input.indexOf(":") > -1) {
			address = input.split(":")[0];
			port = input.split(":")[1];
			customport = true;
		}

		if(port < 1 || port > 65535) {
			return console.error("Port invalid.");
		}

		if(!isIp.v4(address)) {
			dns.resolveSrv("_ts3._udp." + address, (err, srvs) => {
				if(err) {
					dns.resolve4(address, (err, ips) => {
						if(err) {
							return cb(new Error("Invalid address."));
						}

						address = ips[0];
						return cb(null, address, port);
					});
				} else {
					dns.resolve4(srvs[0].name, (err, ips) => {
						if(err) {
							return cb(new Error("Invalid address."));
						}

						address = ips[0];
						port = customport ? port : srvs[0].port;
						return cb(null, address, port);
					});
				}
			});
		} else {
			return cb(null, address, port);
		}
	}
	
	getIPFromInput(req.body.ip, (err, address, port) => {
		if(err) return res.render("index", {
			error: err.name
		});

		if(!fs.existsSync("../usedports.txt")) { fs.writeFileSync("../usedports.txt", "")};
		let proxyport = -1;
		let usedports = fs.readFileSync("../usedports.txt").toString("utf-8");
		for(let i = 0; i < 5; i++) {
			let tempproxyport = Math.floor(Math.random() * (config.ports.to - config.ports.from)) + config.ports.from;
			if(usedports.indexOf(tempproxyport + "\n") == -1) {
				proxyport = tempproxyport;
				fs.writeFileSync("../usedports.txt", proxyport + "\n", {flags: "a"});
				break;
			}
		}
		
		if(proxyport == -1) return res.render("index", {
			error: "Could not find a free port. Please try again."
		});
		
		const { exec } = require('child_process');
		exec("sudo iptables -t nat -A PREROUTING -p udp --dport " + proxyport + " -j DNAT --to-destination " + address + ":" + port + " -m comment --comment \"ts3proxy\"", (err, stdout, stderr) => {
			if(err) {
				console.error(err);
				return res.status(500).render("index", {
					error: "Internal Server Error"
				});
			}

			res.status(200).render("index", {
				proxy: {
					ip: config.ipaddress,
					port: proxyport
				}
			});
		});
	});
});

module.exports = router;
