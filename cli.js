#!/usr/bin/env node
'use strict';
var meow = require('meow');
var speedtest = require('speedtest-net');
var roundTo = require('round-to');
var chalk = require('chalk');

meow({
	help: [
		'Usage',
		'  $ speed-test'
	]
});

speedtest.visual({maxTime: 20000}, function (err, res) {
	if (err) {
		console.error(err);
		process.exit(1);
	}

	console.log([
		'',
		'      Ping:  ' + chalk.cyan(res.server.ping + chalk.dim(' ms')),
		'  Download:  ' + chalk.cyan(roundTo(res.speeds.download, 1) + chalk.dim(' Mbps')),
		'    Upload:  ' + chalk.cyan(roundTo(res.speeds.upload, 1) + chalk.dim(' Mbps'))
	].join('\n'));
});
