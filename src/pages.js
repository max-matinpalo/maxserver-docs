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
