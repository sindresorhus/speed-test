'use strict';
var test = require('ava');
var childProcess = require('child_process');

test('normal', function (t) {
	t.plan(1);

	var cp = childProcess.spawn('./cli.js', {
		cwd: __dirname,
		stdio: 'inherit'
	});

	cp.on('error', function (err) {
		t.assert(!err, err);
	});

	cp.on('close', function (code) {
		t.assert(code === 0);
	});
});

test('--json', function (t) {
	t.plan(1);

	var cp = childProcess.spawn('./cli.js', ['--json'], {
		cwd: __dirname
	});

	cp.stdout.on('data', function (data) {
		data = JSON.parse(data.toString('utf8'));

		if (data.ping === undefined || data.upload === undefined || data.download === undefined || data.upload !== undefined) {
			cp.kill('SIGHUP');
		}
	});

	cp.on('error', function (err) {
		t.assert(!err, err);
	});

	cp.on('close', function (code) {
		t.assert(code === 0);
	});
});

test('--verbose --json', function (t) {
	t.plan(1);

	var cp = childProcess.spawn('./cli.js', ['--verbose', '--json'], {
		cwd: __dirname
	});

	cp.on('data', function (data) {
		data = JSON.parse(data.toString('utf8'));

		if (data.ping === undefined || data.upload === undefined || data.download === undefined || data.upload === undefined) {
			cp.kill('SIGHUP');
		}
	});

	cp.on('error', function (err) {
		t.assert(!err, err);
	});

	cp.on('close', function (code) {
		t.assert(code === 0);
	});
});
