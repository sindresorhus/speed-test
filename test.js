'use strict';
var test = require('ava');
var childProcess = require('child_process');

test(function (t) {
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
