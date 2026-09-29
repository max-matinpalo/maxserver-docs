/**
 * The last five spec URLs, newest first, kept in localStorage.
 */

const KEY = 'maxserver-docs:specs';
const MAX = 5;


export function readRecent(storage = globalThis.localStorage) {
	try {
		const list = JSON.parse(storage.getItem(KEY) || '[]');
		return Array.isArray(list) ? list.filter(u => typeof u === 'string') : [];
	} catch {
		return [];
	}
}


export function rememberSpec(url, storage = globalThis.localStorage) {
	try {
		const list = [url, ...readRecent(storage).filter(u => u !== url)].slice(0, MAX);
		storage.setItem(KEY, JSON.stringify(list));
	} catch {
		// Storage blocked: nothing remembered
	}
}
