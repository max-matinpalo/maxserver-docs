import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readSpec } from '../src/rest/spec.js';
import { resolvePointer, modelName } from '../src/schema/schema.js';
import { slug } from '../src/docs/anchors.js';

const doc = JSON.parse(fs.readFileSync(new URL('../examples/openapi.json', import.meta.url)));


test('groups follow first appearance of tags in paths', () => {
	const spec = readSpec(doc);
	assert.deepEqual(spec.groups.map(g => g.name), ['Auth', 'Misc', 'Projects', 'Tasks']);
	assert.deepEqual(spec.groups[0].operations.map(o => o.label), ['Log in', 'Current user']);
});

test('top-level tags set group order and descriptions', () => {
	const spec = readSpec({ ...doc, tags: [{ name: 'Tasks', description: 'Todo items' }] });
	assert.equal(spec.groups[0].name, 'Tasks');
	assert.equal(spec.groups[0].description, 'Todo items');
});

test('operation anchors like #tag/projects/POST/projects', () => {
	const op = readSpec(doc).operations.find(o => o.method === 'POST' && o.path === '/projects');
	assert.equal(op.id, 'tag/projects/POST/projects');
	assert.equal(readSpec(doc).groups[2].id, 'tag/projects');
});

test('auth, params, body and responses', () => {
	const ops = readSpec(doc).operations;
	const create = ops.find(o => o.method === 'POST' && o.path === '/projects/{projectId}/tasks');
	assert.equal(create.auth, true);
	assert.deepEqual(create.params.path.map(p => [p.name, p.required]), [['projectId', true]]);
	assert.equal(create.body.contentType, 'application/json');
	assert.deepEqual(create.responses.map(r => r.status), ['201', '400', '404']);

	const login = ops.find(o => o.path === '/auth/login');
	assert.equal(login.auth, false);
	assert.deepEqual(login.body.schema.required, ['email', 'password']);
});

test('query params listed with required flags', () => {
	const list = readSpec(doc).operations.find(o => o.method === 'GET' && o.path === '/projects');
	assert.deepEqual(list.params.query.map(p => [p.name, p.required]), [['search', false], ['limit', false], ['offset', false]]);
});

test('untagged operations and models', () => {
	const spec = readSpec({ openapi: '3.1.0', paths: { '/x': { get: { summary: 'X' } } }, components: { schemas: { A: { type: 'object' } } } });
	assert.equal(spec.untagged[0].id, 'operation/GET/x');
	assert.deepEqual(spec.models.map(m => m.id), ['model/A']);
});

test('path-level parameters, operation wins, $ref parameters resolved', () => {
	const spec = readSpec({
		openapi: '3.1.0',
		components: { parameters: { Id: { name: 'id', in: 'path', schema: { type: 'integer' } } } },
		paths: { '/a/{id}': {
			parameters: [{ $ref: '#/components/parameters/Id' }, { name: 'q', in: 'query', description: 'path level' }],
			get: { parameters: [{ name: 'q', in: 'query', description: 'op level' }] },
		} },
	});
	const op = spec.operations[0];
	assert.equal(op.params.path[0].schema.type, 'integer');
	assert.equal(op.params.query[0].description, 'op level');
});

test('invalid documents give readable errors', () => {
	assert.throws(() => readSpec(null), /not a JSON object/);
	assert.throws(() => readSpec({ paths: {} }), /no "openapi"/);
});

test('pointer helpers', () => {
	assert.equal(resolvePointer(doc, '#/components/schemas/User/properties/email').format, 'email');
	assert.equal(modelName('#/components/schemas/User'), 'User');
	assert.equal(modelName('#/components/schemas/User/properties/email'), null);
	assert.equal(slug('My Tag!'), 'my-tag');
});

test('methods keep their order within a path', () => {
	const spec = readSpec({ openapi: '3.1.0', paths: { '/a': { patch: {}, get: {}, delete: {} } } });
	assert.deepEqual(spec.operations.map(o => o.method), ['PATCH', 'GET', 'DELETE']);
});
