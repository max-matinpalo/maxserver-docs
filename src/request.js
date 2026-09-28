/**
 * Test request logic: where requests go, starting inputs, and the
 * request itself. No DOM here, so it can be tested with node --test.
 */

import { exampleFor } from './example.js';


/**
 * Base URL: the spec's first server (relative to the spec), else the
 * spec's origin. No trailing slash.
 */
export function serverBase(doc, specUrl) {
	const server = doc.servers?.[0]?.url;
	const base = server ? new URL(server, specUrl).href : new URL(specUrl).origin;
	return base.replace(/\/+$/, '');
}


function toText(value) {
	if (value === undefined || value === null) return '';
	return typeof value === 'string' ? value : JSON.stringify(value);
}


/**
 * Starting inputs from the schema examples:
 * path rows always on, query rows on when required, spec headers,
 * accept / content-type, and the body example.
 */
export function initialInputs(doc, op) {
	const row = (p, enabled) => ({ key: p.name, value: toText(exampleFor(doc, p.schema)), enabled });

	const headers = [{ key: 'accept', value: 'application/json', enabled: true }];
	if (op.body) headers.push({ key: 'content-type', value: op.body.contentType, enabled: true });
	headers.push(...op.params.header.map(p => row(p, p.required)));

	const body = op.body
		? (op.body.contentType.includes('json') ? JSON.stringify(exampleFor(doc, op.body.schema), null, 2) : toText(exampleFor(doc, op.body.schema)))
		: null;

	return {
		path: op.params.path.map(p => row(p, true)),
		query: op.params.query.map(p => row(p, p.required)),
		headers,
		body,
	};
}


/**
 * Full URL: path params filled in, enabled query rows appended.
 */
export function buildUrl(base, path, pathRows, queryRows) {
	const values = Object.fromEntries(pathRows.map(r => [r.key, r.value]));
	const filled = path.replace(/\{([^}]+)\}/g, (m, name) => values[name] ? encodeURIComponent(values[name]) : m);

	const query = new URLSearchParams();
	for (const r of queryRows) if (r.enabled && r.key) query.append(r.key, r.value);
	const qs = query.toString();

	return base + filled + (qs ? `?${qs}` : '');
}


/**
 * Method, URL, headers, and body to send.
 * The Bearer token is added on auth routes unless a header sets it.
 */
export function buildRequest({ op, base, inputs, token }) {
	const headers = inputs.headers.filter(h => h.enabled && h.key).map(h => [h.key, h.value]);
	const hasAuth = headers.some(([k]) => k.toLowerCase() === 'authorization');
	if (op.auth && token && !hasAuth) headers.push(['authorization', `Bearer ${token}`]);

	const sendsBody = inputs.body !== null && !['GET', 'HEAD'].includes(op.method);
	return {
		method: op.method,
		url: buildUrl(base, op.path, inputs.path, inputs.query),
		headers,
		body: sendsBody ? inputs.body : undefined,
	};
}


/**
 * Readable size: 213 B, 1.4 KB, 2.1 MB.
 */
export function formatSize(bytes) {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}


/**
 * Pretty JSON when the text is JSON, else null.
 */
export function prettyJson(text) {
	try {
		return JSON.stringify(JSON.parse(text), null, 2);
	} catch {
		return null;
	}
}


const STATUS = {
	200: 'OK', 201: 'Created', 202: 'Accepted', 204: 'No Content', 301: 'Moved Permanently', 302: 'Found',
	304: 'Not Modified', 400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found',
	405: 'Method Not Allowed', 409: 'Conflict', 413: 'Payload Too Large', 415: 'Unsupported Media Type',
	422: 'Unprocessable Entity', 429: 'Too Many Requests', 500: 'Internal Server Error', 502: 'Bad Gateway',
	503: 'Service Unavailable', 504: 'Gateway Timeout',
};


/**
 * Status text, also when the response has none (HTTP/2).
 */
export function statusText(code, given) {
	return given || STATUS[code] || '';
}
