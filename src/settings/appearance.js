/**
 * Theme, zoom, and sidebar width: the values kept in localStorage and
 * how they apply to the page. No hooks here, so it can be tested.
 */

export const KEYS = { theme: 'maxserver-docs:theme', zoom: 'maxserver-docs:zoom', width: 'maxserver-docs:sidebar' };
export const ZOOM = { min: 50, max: 200, default: 100 };
export const WIDTH = { min: 200, max: 480, default: 288 };


const clamp = ({ min, max, default: fallback }, value) => {
	const n = Math.round(Number(value));
	return value === '' || value == null || !Number.isFinite(n) ? fallback : Math.min(max, Math.max(min, n));
};

export const clampZoom = value => clamp(ZOOM, value);
export const clampWidth = value => clamp(WIDTH, value);
export const themeSetting = value => ['light', 'dark'].includes(value) ? value : 'auto';


/**
 * The theme shown: the setting, or the system's for auto.
 */
export function effectiveTheme(setting, systemDark) {
	return setting === 'auto' ? (systemDark ? 'dark' : 'light') : setting;
}


export const systemDark = () => typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches;
export const zoomSupported = () => typeof CSS !== 'undefined' && CSS.supports('zoom', '1.5');


/**
 * Sets the theme, zoom, and sidebar width on the page root.
 */
export function applyAppearance({ theme, zoom, width }) {
	const root = document.documentElement;
	root.dataset.theme = theme;
	const zoomed = zoom !== ZOOM.default && zoomSupported();
	root.style.zoom = zoomed ? String(zoom / 100) : '';
	root.style.setProperty('--zoom', zoomed ? String(zoom / 100) : '1');
	root.style.setProperty('--sidebar-width', `${width}px`);
}


/**
 * The stored values, read before the first render so nothing flashes.
 */
export function readAppearance(storage = globalThis.localStorage) {
	const get = key => {
		try {
			return storage.getItem(key);
		} catch {
			return null;
		}
	};
	return { theme: themeSetting(get(KEYS.theme)), zoom: clampZoom(get(KEYS.zoom)), width: clampWidth(get(KEYS.width)) };
}
