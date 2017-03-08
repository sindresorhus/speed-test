#!/usr/bin/env node
'use strict';
var url = require('url');
var meow = require('meow');
var speedtest = require('speedtest-net');
var updateNotifier = require('update-notifier');
var roundTo = require('round-to');
var chalk = require('chalk');
var logUpdate = require('log-update');
var logSymbols = require('log-symbols');
var Ora = require('ora');

var cli = meow([
	'Usage',
	'  $ speed-test',
	'',
	'Options',
	'  -j, --json     Output the result as JSON',
	'  -b, --bytes    Output the result in megabytes per second (MBps)',
	'  -v, --verbose  Output more detailed information'
], {
	alias: {
		j: 'json',
		b: 'bytes',
		v: 'verbose',
		h: 'help'
	}
});

updateNotifier({pkg: cli.pkg}).notify();

var stats = {
	ping: '',
	download: '',
	upload: ''
};

var state = 'ping';
var spinner = new Ora();
var unit = cli.flags.bytes ? 'MBps' : 'Mbps';
var multiplier = cli.flags.bytes ? 1 / 8 : 1;

function getSpinner(x) {
	return state === x ? chalk.gray.dim(spinner.frame()) : '  ';
}

function render() {
	if (cli.flags.json) {
		console.log(JSON.stringify(stats));
		return;
	}

	var output = [
		'',
		'      Ping ' + getSpinner('ping') + stats.ping,
		'  Download ' + getSpinner('download') + stats.download,
		'    Upload ' + getSpinner('upload') + stats.upload
	];

	if (cli.flags.verbose) {
		output = output.concat([
			'',
			'    Server   ' + (stats.data === undefined ? '' : chalk.cyan(stats.data.server.host)),
			'  Location   ' + (stats.data === undefined ? '' : chalk.cyan(stats.data.server.location + chalk.dim(' (' + stats.data.server.country + ')'))),
			'  Distance   ' + (stats.data === undefined ? '' : chalk.cyan(roundTo(stats.data.server.distance, 1) + chalk.dim(' km')))
		]);
	}

	logUpdate(output.join('\n'));
}

function setState(s) {
	state = s;

	if (s && s.length > 0) {
		stats[s] = chalk.yellow('0 ' + chalk.dim(unit));
	}
}

function map(server) {
	server.host = url.parse(server.url).host;
	server.location = server.name;
	server.distance = server.dist;

	return server;
}

var st = speedtest({maxTime: 20000});

if (!cli.flags.json) {
	setInterval(render, 50);
}

st.once('testserver', function (server) {
	if (cli.flags.verbose) {
		stats.data = {
			server: map(server)
		};
	}

	setState('download');
	var ping = Math.round(server.bestPing);
	stats.ping = cli.flags.json ? ping : chalk.cyan(ping + chalk.dim(' ms'));
});

st.on('downloadspeedprogress', function (speed) {
	if (state === 'download' && cli.flags.json !== true) {
		speed *= multiplier;
		var download = roundTo(speed, speed >= 10 ? 0 : 1);
		stats.download = chalk.yellow(download + ' ' + chalk.dim(unit));
	}
});

st.on('uploadspeedprogress', function (speed) {
	if (state === 'upload' && cli.flags.json !== true) {
		speed *= multiplier;
		var upload = roundTo(speed, speed >= 10 ? 0 : 1);
		stats.upload = chalk.yellow(upload + ' ' + chalk.dim(unit));
	}
});

st.once('downloadspeed', function (speed) {
	setState('upload');
	speed *= multiplier;
	var download = roundTo(speed, speed >= 10 && !cli.flags.json ? 0 : 1);
	stats.download = cli.flags.json ? download : chalk.cyan(download + ' ' + chalk.dim(unit));
});

st.once('uploadspeed', function (speed) {
	setState('');
	speed *= multiplier;
	var upload = roundTo(speed, speed >= 10 && !cli.flags.json ? 0 : 1);
	stats.upload = cli.flags.json ? upload : chalk.cyan(upload + ' ' + chalk.dim(unit));
});

st.on('data', function (data) {
	if (cli.flags.verbose) {
		stats.data = data;
	}

	render();
});

st.on('done', function () {
	console.log();
	process.exit();
});

st.on('error', function (err) {
	if (err.code === 'ENOTFOUND') {
		console.error(logSymbols.error, 'Please check your internet connection');
	} else {
		console.error(err);
	}

	process.exit(1);
});
