#!/usr/bin/env node
import process from 'node:process';
import {URL} from 'node:url';
import meow from 'meow';
import speedtest from 'speedtest-net';
import {roundTo} from 'round-to';
import chalk from 'chalk';
import logUpdate from 'log-update';
import logSymbols from 'log-symbols';
import Ora from 'ora';

const cli = meow(`
	Usage
	  $ speed-test

	Options
	  --json -j     Output the result as JSON
	  --bytes -b    Output the result in megabytes per second (MBps)
	  --verbose -v  Output more detailed information
`, {
	importMeta: import.meta,
	flags: {
		json: {
			type: 'boolean',
			alias: 'j',
		},
		bytes: {
			type: 'boolean',
			alias: 'b',
		},
		verbose: {
			type: 'boolean',
			alias: 'v',
		},
	},
});

const stats = {
	ping: '',
	download: '',
	upload: '',
};

let state = 'ping';
const spinner = new Ora();
const unit = cli.flags.bytes ? 'MBps' : 'Mbps';
const multiplier = cli.flags.bytes ? 1 / 8 : 1;

const getSpinnerFromState = inputState => inputState === state ? chalk.gray.dim(spinner.frame()) : '  ';

const logError = error => {
	if (cli.flags.json) {
		console.error(JSON.stringify({error}));
	} else {
		console.error(logSymbols.error, error);
	}
};

function render() {
	if (cli.flags.json) {
		console.log(JSON.stringify(stats));
		return;
	}

	let output = `
      Ping ${getSpinnerFromState('ping')}${stats.ping}
  Download ${getSpinnerFromState('download')}${stats.download}
    Upload ${getSpinnerFromState('upload')}${stats.upload}`;

	if (cli.flags.verbose) {
		output += [
			'',
			'    Server   ' + (stats.data === undefined ? '' : chalk.cyan(stats.data.server.host)),
			'  Location   ' + (stats.data === undefined ? '' : chalk.cyan(stats.data.server.location + chalk.dim(' (' + stats.data.server.country + ')'))),
			'  Distance   ' + (stats.data === undefined ? '' : chalk.cyan(roundTo(stats.data.server.distance, 1) + chalk.dim(' km'))),
		].join('\n');
	}

	logUpdate(output);
}

function setState(newState) {
	state = newState;

	if (newState && newState.length > 0) {
		stats[newState] = chalk.yellow(`0 ${chalk.dim(unit)}`);
	}
}

function map(server) {
	server.host = new URL(server.url).host;
	server.location = server.name;
	server.distance = server.dist;
	return server;
}

const speedTest = speedtest({maxTime: 20_000});

if (!cli.flags.json) {
	setInterval(render, 50);
}

speedTest.once('testserver', server => {
	if (cli.flags.verbose) {
		stats.data = {
			server: map(server),
		};
	}

	setState('download');
	const ping = Math.round(server.bestPing);
	stats.ping = cli.flags.json ? ping : chalk.cyan(ping + chalk.dim(' ms'));
});

speedTest.on('downloadspeedprogress', speed => {
	if (state === 'download' && cli.flags.json !== true) {
		speed *= multiplier;
		const download = roundTo(speed, speed >= 10 ? 0 : 1);
		stats.download = chalk.yellow(`${download} ${chalk.dim(unit)}`);
	}
});

speedTest.on('uploadspeedprogress', speed => {
	if (state === 'upload' && cli.flags.json !== true) {
		speed *= multiplier;
		const upload = roundTo(speed, speed >= 10 ? 0 : 1);
		stats.upload = chalk.yellow(`${upload} ${chalk.dim(unit)}`);
	}
});

speedTest.once('downloadspeed', speed => {
	setState('upload');
	speed *= multiplier;
	const download = roundTo(speed, speed >= 10 && !cli.flags.json ? 0 : 1);
	stats.download = cli.flags.json ? download : chalk.cyan(download + ' ' + chalk.dim(unit));
});

speedTest.once('uploadspeed', speed => {
	setState('');
	speed *= multiplier;
	const upload = roundTo(speed, speed >= 10 && !cli.flags.json ? 0 : 1);
	stats.upload = cli.flags.json ? upload : chalk.cyan(upload + ' ' + chalk.dim(unit));
});

speedTest.on('data', data => {
	if (cli.flags.verbose) {
		stats.data = data;
	}

	render();
});

speedTest.on('done', () => {
	console.log();
	process.exit();
});

speedTest.on('error', error => {
	if (error.code === 'ENOTFOUND') {
		logError('Please check your internet connection');
	} else {
		logError(error);
	}

	process.exit(1);
});
