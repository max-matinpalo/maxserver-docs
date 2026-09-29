/**
 * The page a link shows: the introduction, one tag group, or the models
 * (REST); the server or one tool group (MCP). No DOM, so it can be tested.
 */

import { toolId } from './mcp.js';


export const isMcpLink = hash => hash === 'mcp' || hash.startsWith('mcp/');


export function restPage(hash, model) {
	if (hash === 'models' || hash.startsWith('model/')) return 'models';
	return model.groups.find(g => hash === g.id || hash.startsWith(`${g.id}/`))?.id || 'introduction';
}


export function mcpPage(hash, groups) {
	return groups.find(g => hash === g.id || g.tools.some(t => toolId(t) === hash))?.id || 'mcp';
}


/**
 * The pages in order: id (its first section) and last (its last section).
 */
export function pageList(mode, model, groups) {
	const page = (id, items) => ({ id, last: items.at(-1) ?? id });
	if (mode === 'mcp') return [page('mcp', []), ...groups.map(g => page(g.id, g.tools.map(toolId)))];
	return [
		page('introduction', model.untagged.map(op => op.id)),
		...model.groups.map(g => page(g.id, g.operations.map(op => op.id))),
		...(model.models.length ? [page('models', model.models.map(m => m.id))] : []),
	];
}
