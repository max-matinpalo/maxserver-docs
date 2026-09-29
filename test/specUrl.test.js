import { test } from 'node:test';
import assert from 'node:assert/strict';
import { specUrl } from '../src/rest/specUrl.js';
import { readRecent, rememberSpec } from '../src/rest/recentSpecs.js';

const at = search => ({ search, href: `http://localhost:3002/${search}` });
const root = dataset => ({ dataset });


test('spec url order: ?spec, data-spec, last used, data-default-spec, ./openapi.json', () => {
	const all = root({ spec: '/fixed.json', defaultSpec: '/examples/openapi.json' });
	assert.equal(specUrl(at('?spec=http://x/a.json'), all, 'http://last'), 'http://x/a.json');
	assert.equal(specUrl(at(''), all, 'http://last/'), 'http://localhost:3002/fixed.json');
	assert.equal(specUrl(at(''), root({ defaultSpec: '/examples/openapi.json' }), 'http://last/'), 'http://last/');
	assert.equal(specUrl(at(''), root({ defaultSpec: '/examples/openapi.json' })), 'http://localhost:3002/examples/openapi.json');
	assert.equal(specUrl(at(''), root({})), 'http://localhost:3002/openapi.json');
});

test('recent specs: newest first, no duplicates, at most five', () => {
	const data = {};
	const storage = { getItem: k => data[k] ?? null, setItem: (k, v) => { data[k] = v; } };
	for (const u of ['a', 'b', 'c', 'd', 'e', 'f', 'b']) rememberSpec(u, storage);
	assert.deepEqual(readRecent(storage), ['b', 'f', 'e', 'd', 'c']);
});

test('recent specs survive broken or blocked storage', () => {
	assert.deepEqual(readRecent({ getItem: () => '{bad' }), []);
	assert.doesNotThrow(() => rememberSpec('a', { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } }));
});
