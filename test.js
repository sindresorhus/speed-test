import childProcess from 'node:child_process';
import test from 'ava';
import {execa} from 'execa';
import {pEvent} from 'p-event';

test('main', async t => {
	const subProcess = childProcess.spawn('./cli.js', {stdio: 'inherit'});
	t.is(await pEvent(subProcess, 'close'), 0);
});

test('--json', async t => {
	const {stdout} = await execa('./cli.js', ['--json']);
	const parsed = JSON.parse(stdout);
	t.truthy(parsed.ping);
	t.truthy(parsed.upload);
	t.truthy(parsed.download);
	t.falsy(parsed.data);
});

test('--verbose --json', async t => {
	const {stdout} = await execa('./cli.js', ['--verbose', '--json']);
	const parsed = JSON.parse(stdout);
	t.truthy(parsed.ping);
	t.truthy(parsed.upload);
	t.truthy(parsed.download);
	t.truthy(parsed.data);
});
