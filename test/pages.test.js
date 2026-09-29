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
