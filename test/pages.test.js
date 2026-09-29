import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isMcpLink, mcpPage, restPage } from '../src/pages.js';

const model = { groups: [{ id: 'tag/company' }, { id: 'tag/company-users' }] };
const groups = [{ id: 'mcp/group/invoices', tools: [{ name: 'prepare_invoice' }] }];


test('REST: a tag group, the models, else the introduction', () => {
	assert.equal(restPage('tag/company', model), 'tag/company');
	assert.equal(restPage('tag/company/GET/company', model), 'tag/company');
	assert.equal(restPage('tag/company-users/GET/users', model), 'tag/company-users');
	assert.equal(restPage('model/User', model), 'models');
	assert.equal(restPage('operation/GET/health', model), 'introduction');
	assert.equal(restPage('', model), 'introduction');
});

test('MCP: the group of a tool, else the server', () => {
	assert.equal(mcpPage('mcp/tool/prepare_invoice', groups), 'mcp/group/invoices');
	assert.equal(mcpPage('mcp/group/invoices', groups), 'mcp/group/invoices');
	assert.equal(mcpPage('mcp/tool/unknown', groups), 'mcp');
	assert.equal(isMcpLink('mcp'), true);
	assert.equal(isMcpLink('tag/mcp'), false);
});


test('page order with first and last sections', async () => {
	const { pageList } = await import('../src/pages.js');
	const rest = { untagged: [], groups: [{ id: 'tag/a', operations: [{ id: 'tag/a/GET/a' }, { id: 'tag/a/PUT/a' }] }, { id: 'tag/b', operations: [] }], models: [{ id: 'model/User' }] };
	assert.deepEqual(pageList('rest', rest, []), [
		{ id: 'introduction', last: 'introduction' },
		{ id: 'tag/a', last: 'tag/a/PUT/a' },
		{ id: 'tag/b', last: 'tag/b' },
		{ id: 'models', last: 'model/User' },
	]);
	assert.deepEqual(pageList('mcp', rest, groups), [{ id: 'mcp', last: 'mcp' }, { id: 'mcp/group/invoices', last: 'mcp/tool/prepare_invoice' }]);
});
