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
		'  --json     Output the result as JSON',
		'  --verbose  Output more detailed information'
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
	return state === x ? chalk.gray.dim(frame()) : ' ';
}

function render() {
	if (cli.flags.json) {
		console.log(JSON.stringify(stats));
		return;
	}

	var output = [
		'',
		'      Ping ' + getSpinner('ping') + ' ' + stats.ping,
		'  Download ' + getSpinner('download') + ' ' + stats.download,
		'    Upload ' + getSpinner('upload') + ' ' + stats.upload
	];

	if (cli.flags.verbose && stats.data) {
		output = output.concat([
			'',
			'    Server   ' + chalk.cyan(stats.data.server.host),
			'  Location   ' + chalk.cyan(stats.data.server.location + chalk.dim(' (' + stats.data.server.country + ')')),
			'  Distance   ' + chalk.cyan(stats.data.server.distance + chalk.dim(' km'))
		]);
	}

	logUpdate(output.join('\n'));
}

function setState(s) {
	state = s;

	if (s && s.length > 0) {
		stats[s] = chalk.yellow('0' + chalk.dim(' Mbps'));
	}
}

var st = speedtest({maxTime: 20000});

if (!cli.flags.json) {
	setInterval(render, 50);
}

st.once('testserver', function (server) {
	setState('download');
	var ping = Math.round(server.bestPing);
	stats.ping = (cli.flags.json) ? ping : chalk.cyan(ping + chalk.dim(' ms'));
});

st.on('downloadspeedprogress', function (speed) {
	if (state === 'download' && cli.flags.json !== true) {
		var download = roundTo(speed, 1);
		stats.download = chalk.yellow(download + chalk.dim(' Mbps'));
	}
});

st.on('uploadspeedprogress', function (speed) {
	if (state === 'upload' && cli.flags.json !== true) {
		var upload = roundTo(speed, 1);
		stats.upload = chalk.yellow(upload + chalk.dim(' Mbps'));
	}
});

st.once('downloadspeed', function (speed) {
	setState('upload');
	var download = roundTo(speed, 1);
	stats.download = (cli.flags.json) ? download : chalk.cyan(download + chalk.dim(' Mbps'));
});

st.once('uploadspeed', function (speed) {
	setState('');
	var upload = roundTo(speed, 1);
	stats.upload = (cli.flags.json) ? upload : chalk.cyan(upload + chalk.dim(' Mbps'));
});

st.on('data', function (data) {
	if (cli.flags.verbose) {
		stats.data = data;
	}
	render();
});

st.on('done', function () {
	process.exit();
});

st.on('error', function (err) {
	console.error(err);
	process.exit(1);
});
