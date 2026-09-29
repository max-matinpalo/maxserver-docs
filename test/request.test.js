import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readSpec } from '../src/rest/spec.js';
import { serverBase, initialInputs, buildUrl, buildRequest } from '../src/rest/request.js';
import { formatSize, prettyJson } from '../src/docs/http.js';

const doc = JSON.parse(fs.readFileSync(new URL('../examples/openapi.json', import.meta.url)));
const ops = readSpec(doc).operations;
const find = (method, path) => ops.find(o => o.method === method && o.path === path);


test('server base: first server relative to the spec, else spec origin', () => {
	assert.equal(serverBase(doc, 'http://localhost:3000/docs/openapi.json'), 'http://localhost:3000');
	assert.equal(serverBase({ servers: [{ url: '/api/' }] }, 'http://x.dev/docs/openapi.json'), 'http://x.dev/api');
	assert.equal(serverBase({ servers: [{ url: 'https://api.x.dev' }] }, 'http://x.dev/docs/openapi.json'), 'https://api.x.dev');
});

test('initial inputs from examples', () => {
	const inputs = initialInputs(doc, find('POST', '/projects/{projectId}/tasks'));
	assert.deepEqual(inputs.path, [{ key: 'projectId', value: 'p1', enabled: true }]);
	assert.deepEqual(inputs.headers.map(h => h.key), ['accept', 'content-type']);
	assert.equal(JSON.parse(inputs.body).title, 'Write landing page copy');
});

test('optional query params start switched off with their example or default', () => {
	const inputs = initialInputs(doc, find('GET', '/projects'));
	assert.deepEqual(inputs.query.map(q => [q.key, q.value, q.enabled]), [['search', 'web', false], ['limit', '20', false], ['offset', '0', false]]);
	assert.equal(inputs.body, null);
});

test('url: path params filled and encoded, enabled query rows only', () => {
	const url = buildUrl('http://h', '/projects/{projectId}/tasks', [{ key: 'projectId', value: 'a b' }],
		[{ key: 'status', value: 'done', enabled: true }, { key: 'x', value: '1', enabled: false }]);
	assert.equal(url, 'http://h/projects/a%20b/tasks?status=done');
});

test('token added on auth routes only, never over an explicit header', () => {
	const op = find('GET', '/auth/me');
	const inputs = initialInputs(doc, op);
	assert.deepEqual(buildRequest({ op, base: 'http://h', inputs, token: 't1' }).headers.at(-1), ['authorization', 'Bearer t1']);

	const login = find('POST', '/auth/login');
	assert.equal(buildRequest({ op: login, base: 'http://h', inputs: initialInputs(doc, login), token: 't1' }).headers.some(([k]) => k === 'authorization'), false);

	const own = { ...inputs, headers: [...inputs.headers, { key: 'Authorization', value: 'Bearer mine', enabled: true }] };
	assert.equal(buildRequest({ op, base: 'http://h', inputs: own, token: 't1' }).headers.filter(([k]) => k.toLowerCase() === 'authorization').length, 1);
});

test('body only for methods that send one', () => {
	const op = find('POST', '/projects');
	const req = buildRequest({ op, base: 'http://h', inputs: initialInputs(doc, op), token: '' });
	assert.equal(req.method, 'POST');
	assert.equal(JSON.parse(req.body).name, 'Website relaunch');
});

test('size and pretty json', () => {
	assert.equal(formatSize(213), '213 B');
	assert.equal(formatSize(1536), '1.5 KB');
	assert.equal(prettyJson('{"a":1}'), '{\n  "a": 1\n}');
	assert.equal(prettyJson('nope'), null);
});
