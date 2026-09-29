import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mcpUrl, mcpHeaders, readReply, replyError, connect, toolHints, toolView, toolLabel } from '../src/mcp.js';
import { viewCsp, viewDocument, resourceBytes, resourceText, fileName } from '../src/mcpView.js';


test('endpoint: a path joins the server base, a URL stays', () => {
	assert.equal(mcpUrl('http://localhost:3000', '/mcp'), 'http://localhost:3000/mcp');
	assert.equal(mcpUrl('http://x.dev/api', 'mcp'), 'http://x.dev/api/mcp');
	assert.equal(mcpUrl('http://x.dev', 'https://other.dev/mcp'), 'https://other.dev/mcp');
});

test('headers: token, then session and protocol once known', () => {
	assert.deepEqual(mcpHeaders({}).map(([k]) => k), ['accept', 'content-type']);
	assert.deepEqual(mcpHeaders({ token: 't', sessionId: 's', protocolVersion: '2025-06-18' }).slice(2),
		[['authorization', 'Bearer t'], ['mcp-session-id', 's'], ['mcp-protocol-version', '2025-06-18']]);
});

test('reply: JSON body, or the event with the id from a stream', () => {
	assert.deepEqual(readReply('{"jsonrpc":"2.0","id":1,"result":{}}', 'application/json', 1).result, {});
	assert.equal(readReply('not json', 'application/json', 1), null);
	const stream = 'event: message\ndata: {"jsonrpc":"2.0","method":"notifications/progress"}\n\n'
		+ 'event: message\ndata: {"jsonrpc":"2.0","id":7,\ndata: "result":{"ok":true}}\n\n';
	assert.deepEqual(readReply(stream, 'text/event-stream', 7).result, { ok: true });
	assert.equal(readReply(stream, 'text/event-stream', 8), null);
});

test('reply errors: 401, JSON-RPC error, HTTP error, no reply', () => {
	assert.equal(replyError({ code: 401 }).unauthorized, true);
	assert.match(replyError({ code: 200, reply: { error: { code: -32602, message: 'Unknown tool' } } }).message, /Unknown tool \(JSON-RPC error -32602\)/);
	assert.match(replyError({ code: 500, statusText: 'Internal Server Error', reply: null }).message, /HTTP 500/);
	assert.match(replyError({ code: 200, reply: null }).message, /no JSON-RPC reply/);
	assert.equal(replyError({ code: 200, reply: { result: {} } }), null);
});

test('connect: handshake, session headers, and every page of the lists', async () => {
	const sent = [];
	const tools = [{ name: 'a' }, { name: 'b' }];
	globalThis.fetch = async (url, { headers, body }) => {
		const message = JSON.parse(body);
		sent.push({ method: message.method, headers: Object.fromEntries(headers) });
		const results = {
			initialize: { protocolVersion: '2025-03-26', capabilities: { tools: {}, resources: {} }, serverInfo: { name: 'demo' }, instructions: 'Hi' },
			'tools/list': message.params?.cursor ? { tools: [tools[1]] } : { tools: [tools[0]], nextCursor: 'p2' },
			'resources/list': { resources: [{ uri: 'ui://demo/a.html' }] },
		};
		if (!message.id) return new Response(null, { status: 202 });
		return new Response(JSON.stringify({ jsonrpc: '2.0', id: message.id, result: results[message.method] }),
			{ headers: { 'content-type': 'application/json', 'mcp-session-id': 'S1' } });
	};

	const server = await connect('http://x.dev/mcp', 'T');
	assert.deepEqual(sent.map(s => s.method), ['initialize', 'notifications/initialized', 'tools/list', 'tools/list', 'resources/list']);
	assert.equal(sent[0].headers['mcp-session-id'], undefined);
	assert.equal(sent[2].headers['mcp-session-id'], 'S1');
	assert.equal(sent[2].headers['mcp-protocol-version'], '2025-03-26');
	assert.equal(sent[2].headers.authorization, 'Bearer T');
	assert.deepEqual(server.tools.map(t => t.name), ['a', 'b']);
	assert.equal(server.resources.length, 1);
	assert.equal(server.instructions, 'Hi');
	assert.equal(server.session.token, undefined);
});

test('tool helpers: label, view, and hint pills', () => {
	const tool = { name: 'get_x', title: 'Get X', annotations: { readOnlyHint: true, idempotentHint: true }, _meta: { ui: { resourceUri: 'ui://x.html' } } };
	assert.equal(toolLabel(tool), 'Get X');
	assert.equal(toolLabel({ name: 'n' }), 'n');
	assert.equal(toolView(tool), 'ui://x.html');
	assert.equal(toolView({ _meta: { 'openai/outputTemplate': 'ui://y.html' } }), 'ui://y.html');
	assert.deepEqual(toolHints(tool), ['read-only', 'idempotent', 'view']);
	assert.deepEqual(toolHints({ annotations: { destructiveHint: true } }), ['destructive']);
});

test('view CSP: inline code only, plus declared domains', () => {
	assert.equal(viewCsp(), "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; media-src data: blob:; connect-src 'none'");
	const csp = viewCsp({ resourceDomains: ['https://cdn.x.dev', 'bad" onload'], connectDomains: ['https://api.x.dev'] });
	assert.match(csp, /script-src 'unsafe-inline' https:\/\/cdn\.x\.dev;/);
	assert.match(csp, /connect-src https:\/\/api\.x\.dev$/);
	assert.doesNotMatch(csp, /onload/);
	assert.match(viewDocument('<html><head><title>V</title></head></html>'), /^<html><head><meta http-equiv="Content-Security-Policy"[^>]+><title>/);
	assert.match(viewDocument('<p>no head</p>'), /^<meta [^>]+><p>/);
});

test('resources: bytes, text, and file names', () => {
	assert.deepEqual([...resourceBytes({ blob: btoa('PDF') })], [80, 68, 70]);
	assert.equal(resourceText({ blob: btoa('hello') }), 'hello');
	assert.equal(resourceText({ text: 'plain' }), 'plain');
	assert.equal(fileName('chatcountant://reports/vat%202026.pdf'), 'vat 2026.pdf');
	assert.equal(fileName(''), 'download');
});


test('tool groups: _meta.group in first appearance order, the rest in Tools', async () => {
	const { toolGroups } = await import('../src/mcp.js');
	const groups = toolGroups([{ name: 'a', _meta: { group: 'Receipts' } }, { name: 'b' }, { name: 'c', _meta: { group: 'Receipts' } }, { name: 'd', _meta: { group: 'Bank lines' } }]);
	assert.deepEqual(groups.map(g => [g.id, g.name, g.tools.map(t => t.name).join('')]), [['mcp/group/receipts', 'Receipts', 'ac'], ['mcp/group/tools', 'Tools', 'b'], ['mcp/group/bank-lines', 'Bank lines', 'd']]);
});
