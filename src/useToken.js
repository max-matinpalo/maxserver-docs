import { useState } from 'preact/hooks';

const KEY = 'maxserver-docs:token';


function read() {
	try {
		return localStorage.getItem(KEY) || '';
	} catch {
		return '';
	}
}


/**
 * Bearer token remembered in localStorage (per browser, not per page).
 */
export function useToken() {
	const [token, setState] = useState(read);

	const setToken = value => {
		setState(value);
		try {
			if (value) localStorage.setItem(KEY, value);
			else localStorage.removeItem(KEY);
		} catch {
			// Storage blocked: the token lives only for this page
		}
	};

	return [token, setToken];
}
