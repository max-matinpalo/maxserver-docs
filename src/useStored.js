import { useState } from 'preact/hooks';


function read(key) {
	try {
		return localStorage.getItem(key) || '';
	} catch {
		return '';
	}
}


/**
 * A string remembered in localStorage (per browser, not per page),
 * like the Bearer token and the MCP path.
 */
export function useStored(key) {
	const [value, setState] = useState(() => read(key));

	const setValue = next => {
		setState(next);
		try {
			if (next) localStorage.setItem(key, next);
			else localStorage.removeItem(key);
		} catch {
			// Storage blocked: the value lives only for this page
		}
	};

	return [value, setValue];
}
