import test from 'ava';
import childProcess from 'child_process';

test('main', t => {
	t.plan(1);

	const cp = childProcess.spawn('./cli.js', {
		cwd: __dirname,
		stdio: 'inherit'
	});

	cp.on('error', err => t.ifError(err));
	cp.on('close', code => t.is(code, 0));
});

test('--json', t => {
	childProcess.execFile('./cli.js', ['--json'], {
		cwd: __dirname
	}, (err, data) => {
		t.ifError(err);

		data = JSON.parse(data);

		t.not(data.ping, undefined);
		t.not(data.upload, undefined);
		t.not(data.download, undefined);
		t.is(data.data, undefined);

		t.end();
	});
});

test('--verbose --json', t => {
	childProcess.execFile('./cli.js', ['--verbose', '--json'], {
		cwd: __dirname
	}, (err, data) => {
		t.ifError(err);

		data = JSON.parse(data);

		t.not(data.ping, undefined);
		t.not(data.upload, undefined);
		t.not(data.download, undefined);
		t.not(data.data, undefined);

		t.end();
	});
});
