import { useEffect, useState } from 'preact/hooks';

const read = () => decodeURIComponent(location.hash.slice(1));


/**
 * The hash last navigated to by a link, back, or forward. Scrolling
 * rewrites the hash with replaceState, which leaves this unchanged.
 */
export function useHash() {
	const [hash, setHash] = useState(read);

	useEffect(() => {
		const change = () => setHash(read());
		addEventListener('hashchange', change);
		return () => removeEventListener('hashchange', change);
	}, []);

	return hash;
}
