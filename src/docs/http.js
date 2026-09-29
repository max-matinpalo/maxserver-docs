/**
 * How a response shows: status text, size, and pretty JSON. No DOM here,
 * so it can be tested with node --test.
 */

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
