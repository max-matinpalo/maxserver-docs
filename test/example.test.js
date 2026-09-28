import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { exampleFor } from '../src/example.js';

const doc = JSON.parse(fs.readFileSync(new URL('../examples/openapi.json', import.meta.url)));


test('examples from schema examples through $ref models', () => {
	assert.deepEqual(exampleFor(doc, { $ref: '#/components/schemas/User' }), { id: 'u1', email: 'max@example.com', name: 'Max' });
});

test('arrays of models', () => {
	const value = exampleFor(doc, { type: 'array', items: { $ref: '#/components/schemas/Task' } });
	assert.equal(value.length, 1);
	assert.equal(value[0].status, 'todo');
});

test('order: examples, example, default, const, enum, type', () => {
	assert.equal(exampleFor(doc, { type: 'string', examples: ['a'], example: 'b', default: 'c' }), 'a');
	assert.equal(exampleFor(doc, { type: 'string', example: 'b', default: 'c' }), 'b');
	assert.equal(exampleFor(doc, { type: 'integer', default: 20 }), 20);
	assert.equal(exampleFor(doc, { const: 'x' }), 'x');
	assert.equal(exampleFor(doc, { enum: ['todo', 'done'] }), 'todo');
	assert.equal(exampleFor(doc, { type: 'string', format: 'date' }), '2026-01-01');
	assert.equal(exampleFor(doc, { type: 'string' }), '');
	assert.equal(exampleFor(doc, { type: 'integer', minimum: 5 }), 5);
	assert.equal(exampleFor(doc, { type: 'boolean' }), true);
});

test('allOf merges, oneOf takes the first variant', () => {
	assert.deepEqual(exampleFor(doc, { allOf: [{ properties: { a: { type: 'integer' } } }, { properties: { b: { type: 'boolean' } } }] }), { a: 1, b: true });
	assert.equal(exampleFor(doc, { oneOf: [{ type: 'string', examples: ['first'] }, { type: 'integer' }] }), 'first');
});

test('recursive models stop', () => {
	const d = { components: { schemas: { Node: { type: 'object', properties: { name: { type: 'string' }, child: { $ref: '#/components/schemas/Node' } } } } } };
	assert.deepEqual(exampleFor(d, { $ref: '#/components/schemas/Node' }), { name: '', child: {} });
});
