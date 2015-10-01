'use strict';
var test = require('ava');
var childProcess = require('child_process');

test('main', function (t) {
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
	childProcess.execFile('./cli.js', ['--json'], {cwd: __dirname, encoding: 'utf8'}, function (err, data) {
		if (err) {
			t.fail(err);
		} else {
			data = JSON.parse(data);

			t.false(data.ping === undefined);
			t.false(data.upload === undefined);
			t.false(data.download === undefined);
			t.true(data.data === undefined);
		}

		t.end();
	});
});

test('--verbose --json', function (t) {
	childProcess.execFile('./cli.js', ['--verbose', '--json'], {cwd: __dirname, encoding: 'utf8'}, function (err, data) {
		if (err) {
			t.fail(err);
		} else {
			data = JSON.parse(data);

			t.false(data.ping === undefined);
			t.false(data.upload === undefined);
			t.false(data.download === undefined);
			t.false(data.data === undefined);
		}

		t.end();
	});
});
