import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { KEYS, applyAppearance, clampWidth, clampZoom, effectiveTheme, systemDark, themeSetting } from './appearance.js';
import { useStored } from '../useStored.js';


/**
 * Theme, zoom, and sidebar width from localStorage, applied to the page.
 * Auto follows the system theme, also when it changes.
 */
export function useAppearance() {
	const [storedTheme, setTheme] = useStored(KEYS.theme);
	const [storedZoom, setZoom] = useStored(KEYS.zoom);
	const [storedWidth, setWidth] = useStored(KEYS.width);
	const [dark, setDark] = useState(systemDark);

	// 1. System theme changes, for auto
	useEffect(() => {
		const query = typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)');
		if (!query?.addEventListener) return;
		const change = e => setDark(e.matches);
		query.addEventListener('change', change);
		return () => query.removeEventListener('change', change);
	}, []);

	// 2. Apply before paint; after a new zoom, which can change the layout,
	// the section in the hash (the one at the top) stays at the top
	const theme = themeSetting(storedTheme);
	const shown = effectiveTheme(theme, dark);
	const zoom = clampZoom(storedZoom);
	const width = clampWidth(storedWidth);
	const zoomBefore = useRef(zoom);
	useLayoutEffect(() => {
		applyAppearance({ theme: shown, zoom, width });
		if (zoomBefore.current !== zoom) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({ behavior: 'instant', block: 'start' });
		zoomBefore.current = zoom;
	}, [shown, zoom, width]);

	return {
		theme, shown, zoom, width,
		setTheme: value => setTheme(value === 'auto' ? '' : value),
		setZoom: value => setZoom(String(clampZoom(value))),
		setWidth: value => setWidth(String(clampWidth(value))),
	};
}
