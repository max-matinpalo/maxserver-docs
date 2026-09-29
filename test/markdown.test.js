import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseMarkdown, parseInline, safeUrl } from '../src/markdown.js';
import { tokenizeJson } from '../src/json.js';


test('inline code, strong, em, links, emails', () => {
	const tokens = parseInline('Use `token`, **bold**, *em*, [docs](https://x.dev) or max@example.com.');
	assert.deepEqual(tokens.map(t => t.type), ['text', 'code', 'text', 'strong', 'text', 'em', 'text', 'link', 'text', 'link', 'text']);
	assert.equal(tokens.at(-2).href, 'mailto:max@example.com');
});

test('unsafe links become text', () => {
	assert.equal(safeUrl('javascript:alert(1)'), null);
	assert.deepEqual(parseInline('[x](javascript:alert(1))')[0].type, 'text');
	assert.equal(safeUrl('/docs'), '/docs');
});

test('blocks: paragraphs, lists, headings, code', () => {
	const blocks = parseMarkdown('# Title\n\nLine one\nline two\n\n- a\n- b\n\n1. x\n\n```\ncode\n```');
	assert.deepEqual(blocks.map(b => b.type), ['heading', 'paragraph', 'list', 'list', 'codeblock']);
	assert.equal(blocks[1].children[0].text, 'Line one line two');
	assert.equal(blocks[3].ordered, true);
	assert.equal(blocks[4].text, 'code');
});

test('json tokens', () => {
	const types = tokenizeJson('{\n  "a": "b",\n  "n": 1,\n  "t": true\n}').filter(t => t.type !== 'punct').map(t => t.type);
	assert.deepEqual(types, ['key', 'string', 'key', 'number', 'key', 'literal']);
});


test('all-caps runs with a word of five or more letters are strong; abbreviations stay text', () => {
	const tokens = parseInline('RECEIPTS FIRST. Send the VAT PDF. CONTEXT: JSON-RPC and NEVER guess.');
	const strong = tokens.filter(t => t.type === 'strong').map(t => t.children[0].text);
	assert.deepEqual(strong, ['RECEIPTS FIRST', 'CONTEXT', 'NEVER']);
	assert.equal(tokens.map(t => t.text ?? t.children[0].text).join(''), 'RECEIPTS FIRST. Send the VAT PDF. CONTEXT: JSON-RPC and NEVER guess.');

	// A short label that starts the paragraph
	assert.equal(parseInline('WHEN. Only once. Not VAT.')[0].type, 'strong');
	assert.equal(parseInline('VAT is due.')[0].type, 'text');
});
