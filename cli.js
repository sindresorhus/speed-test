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
		'  $ speed-test'
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
	return state === x ? chalk.cyan.dim(frame()) : '';
}

function render() {
	logUpdate([
		'',
		'      Ping  ' + stats.ping + getSpinner('ping'),
		'  Download  ' + stats.download + getSpinner('download'),
		'    Upload  ' + stats.upload + getSpinner('upload')
	].join('\n'));
}

var st = speedtest({maxTime: 20000});

setInterval(render, 50);

st.once('testserver', function (server) {
	state = 'download';
	stats.ping = chalk.cyan(Math.round(server.bestPing) + chalk.dim(' ms'));
});

st.once('downloadspeed', function (speed) {
	state = 'upload';
	stats.download = chalk.cyan(roundTo(speed, 1) + chalk.dim(' Mbps'));
});

st.once('uploadspeed', function (speed) {
	state = '';
	stats.upload = chalk.cyan(roundTo(speed, 1) + chalk.dim(' Mbps'));
	render();
	process.exit();
});

st.on('error', function (err) {
	console.error(err);
	process.exit(1);
});
