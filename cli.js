#!/usr/bin/env node
'use strict';
var meow = require('meow');
var speedtest = require('speedtest-net');
var updateNotifier = require('update-notifier');
var roundTo = require('round-to');
var chalk = require('chalk');
var logUpdate = require('log-update');
var elegantSpinner = require('elegant-spinner');

var cli = meow({
	help: [
		'Usage',
		'  $ speed-test',
		'',
		'Options',
		'  --json  Output the result as JSON'
	]
});

updateNotifier({pkg: cli.pkg}).notify();

var stats = {
	ping: '',
	download: '',
	upload: ''
};

var state = 'ping';
var frame = elegantSpinner();

function getSpinner(x) {
	return state === x ? chalk.cyan.dim(frame()) : ' ';
}

function render() {
	if (cli.flags.json) {
		console.log(JSON.stringify(stats));
		return;
	}

	logUpdate([
		'',
		getSpinner('ping') +		'     Ping ' + stats.ping,
		getSpinner('download') + 	' Download ' + stats.download,
		getSpinner('upload') +		'   Upload ' + stats.upload
	].join('\n'));
}

var st = speedtest({maxTime: 20000});

if (!cli.flags.json) {
	setInterval(render, 50);
}

st.once('testserver', function (server) {
	state = 'download';
	var ping = Math.round(server.bestPing);
	stats.ping = (cli.flags.json) ? ping : chalk.cyan(ping + chalk.dim(' ms'));
});

st.on('downloadspeedprogress', function (speed) {
	if (state === 'download') {
		var download = roundTo(speed, 1);
		stats.download = (cli.flags.json) ? download : chalk.yellow(download + chalk.dim(' Mbps'));
	}
});

st.on('uploadspeedprogress', function (speed) {
	if (state === 'upload') {
		var upload = roundTo(speed, 1);
		stats.upload = (cli.flags.json) ? upload : chalk.yellow(upload + chalk.dim(' Mbps'));
	}
});

st.once('downloadspeed', function (speed) {
	state = 'upload';
	var download = roundTo(speed, 1);
	stats.download = (cli.flags.json) ? download : chalk.cyan(download + chalk.dim(' Mbps'));
});

st.once('uploadspeed', function (speed) {
	state = '';
	var upload = roundTo(speed, 1);
	stats.upload = (cli.flags.json) ? upload : chalk.cyan(upload + chalk.dim(' Mbps'));
	render();
	process.exit();
});

st.on('error', function (err) {
	console.error(err);
	process.exit(1);
});
