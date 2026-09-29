/**
 * A small MCP client over Streamable HTTP, as ChatGPT uses it: one
 * JSON-RPC message per POST, answered as JSON or an event stream.
 * No DOM here, so it can be tested with node --test.
 */

import { statusText } from './request.js';
import { slug } from './spec.js';

export const PROTOCOL_VERSION = '2025-06-18';
const CLIENT_INFO = { name: 'maxserver-docs', version: '3' };
const MAX_PAGES = 50;
let nextId = 1;


/**
 * The endpoint: a path relative to the server base, or a full URL.
 */
export function mcpUrl(base, path) {
	if (/^https?:\/\//i.test(path)) return path;
	return `${base}/${path.replace(/^\/+/, '')}`;
}


/**
 * Headers for a message: the token, then the session once initialized.
 */
export function mcpHeaders({ token, sessionId, protocolVersion }) {
	const headers = [['accept', 'application/json, text/event-stream'], ['content-type', 'application/json']];
	if (token) headers.push(['authorization', `Bearer ${token}`]);
	if (sessionId) headers.push(['mcp-session-id', sessionId]);
	if (protocolVersion) headers.push(['mcp-protocol-version', protocolVersion]);
	return headers;
}


/**
 * The JSON-RPC reply with this id from a JSON or event-stream body, else null.
 */
export function readReply(text, contentType, id) {
	if (!contentType.includes('text/event-stream')) {
		try {
			return JSON.parse(text);
		} catch {
			return null;
		}
	}
	for (const event of text.split(/\r?\n\r?\n/)) {
		const data = event.split(/\r?\n/).filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n');
		try {
			const message = data && JSON.parse(data);
			if (message?.id === id) return message;
		} catch {
			// Not JSON: skip the event
		}
	}
	return null;
}


/**
 * Posts one message. Returns what the test panel shows: HTTP status,
 * time, size, headers, the body text, and the parsed reply.
 */
export async function post(session, method, params) {

	// 1. The message; a notification has no id
	const notification = method.startsWith('notifications/');
	const message = { jsonrpc: '2.0', ...(!notification && { id: nextId++ }), method, ...(params && { params }) };
	const headers = mcpHeaders(session);

	// 2. Send and read
	const start = performance.now();
	const res = await fetch(session.url, { method: 'POST', headers, body: JSON.stringify(message), credentials: 'include' });
	const buffer = await res.arrayBuffer();
	const text = new TextDecoder().decode(buffer);
	const contentType = res.headers.get('content-type') || '';

	return {
		code: res.status,
		statusText: statusText(res.status, res.statusText),
		time: performance.now() - start,
		size: buffer.byteLength,
		text,
		reply: notification ? null : readReply(text, contentType, message.id),
		sessionId: res.headers.get('mcp-session-id'),
		requestHeaders: headers,
		responseHeaders: [...res.headers],
	};
}


/**
 * The error a reply stands for, or null: HTTP errors without a reply,
 * a missing reply, or a JSON-RPC error.
 */
export function replyError(response) {
	const { code, statusText: text, reply } = response;
	if (code === 401) return Object.assign(new Error('The MCP server needs a Bearer token (401 Unauthorized).'), { unauthorized: true });
	if (reply?.error) return new Error(`${reply.error.message} (JSON-RPC error ${reply.error.code})`);
	if (code >= 400) return new Error(`HTTP ${code} ${text}`.trim());
	if (!reply || !('result' in reply)) return new Error('The server sent no JSON-RPC reply.');
	return null;
}


/**
 * One request; its result, or the error it stands for.
 */
export async function request(session, method, params) {
	const response = await post(session, method, params);
	const error = replyError(response);
	if (error) throw error;
	return { result: response.reply.result, sessionId: response.sessionId };
}


async function listAll(session, method, key) {
	const items = [];
	let cursor;
	for (let page = 0; page < MAX_PAGES; page++) {
		const { result } = await request(session, method, cursor ? { cursor } : undefined);
		items.push(...(result[key] || []));
		cursor = result.nextCursor;
		if (!cursor) break;
	}
	return items;
}


/**
 * The handshake and catalog, as ChatGPT reads them: initialize,
 * initialized, then every page of tools/list and resources/list.
 */
export async function connect(url, token) {

	// 1. Handshake: the session headers apply to every later message
	const init = await request({ url, token }, 'initialize', { protocolVersion: PROTOCOL_VERSION, capabilities: {}, clientInfo: CLIENT_INFO });
	const info = init.result;
	const session = { url, sessionId: init.sessionId || null, protocolVersion: info.protocolVersion || PROTOCOL_VERSION };
	await post({ ...session, token }, 'notifications/initialized');

	// 2. Catalog
	const capabilities = info.capabilities || {};
	return {
		session,
		server: info.serverInfo || {},
		protocolVersion: session.protocolVersion,
		instructions: info.instructions || '',
		tools: capabilities.tools ? await listAll({ ...session, token }, 'tools/list', 'tools') : [],
		resources: capabilities.resources ? await listAll({ ...session, token }, 'resources/list', 'resources') : [],
	};
}


export const toolId = tool => `mcp/tool/${tool.name}`;


/**
 * Tools grouped by _meta.group in first appearance order; ungrouped ones form Tools.
 */
export function toolGroups(tools) {
	const groups = new Map();
	for (const tool of tools) {
		const name = typeof tool._meta?.group === 'string' && tool._meta.group.trim() || 'Tools';
		if (!groups.has(name)) groups.set(name, { id: `mcp/group/${slug(name)}`, name, tools: [] });
		groups.get(name).tools.push(tool);
	}
	return [...groups.values()];
}
export const toolLabel = tool => tool.title || tool.annotations?.title || tool.name;


/**
 * The ui:// resource a tool renders its result with, else null.
 */
export function toolView(tool) {
	return tool._meta?.ui?.resourceUri || tool._meta?.['openai/outputTemplate'] || null;
}


/**
 * Pills from the hints a tool sets, and whether it has a view.
 */
export function toolHints(tool) {
	const a = tool.annotations || {};
	const hints = [];
	if (a.readOnlyHint) hints.push('read-only');
	else if (a.destructiveHint) hints.push('destructive');
	if (a.idempotentHint) hints.push('idempotent');
	if (toolView(tool)) hints.push('view');
	return hints;
}
