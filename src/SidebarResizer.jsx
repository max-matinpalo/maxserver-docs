import { WIDTH, clampWidth } from './appearance.js';
import styles from './SidebarResizer.module.css';

const STEP = 16;


/**
 * The sidebar's right edge: drag, or arrow keys, to set its width;
 * double-click restores the default. While dragging only the CSS
 * variable changes, so the docs do not re-render on every move.
 */
export function SidebarResizer({ width, zoom, onChange }) {
	const down = e => {
		e.preventDefault();
		const handle = e.currentTarget;
		const start = e.clientX;
		let next = width;
		handle.setPointerCapture(e.pointerId);

		const move = ev => {
			next = clampWidth(width + (ev.clientX - start) / (zoom / 100));
			document.documentElement.style.setProperty('--sidebar-width', `${next}px`);
		};
		const up = () => {
			handle.removeEventListener('pointermove', move);
			handle.removeEventListener('pointerup', up);
			handle.removeEventListener('pointercancel', up);
			onChange(next);
		};
		handle.addEventListener('pointermove', move);
		handle.addEventListener('pointerup', up);
		handle.addEventListener('pointercancel', up);
	};

	const key = e => {
		const step = e.key === 'ArrowLeft' ? -STEP : e.key === 'ArrowRight' ? STEP : 0;
		if (!step) return;
		e.preventDefault();
		onChange(width + step);
	};

	return (
		<div class={styles.resizer} role="separator" aria-orientation="vertical" aria-label="Sidebar width"
			aria-valuenow={width} aria-valuemin={WIDTH.min} aria-valuemax={WIDTH.max} tabIndex={0}
			onPointerDown={down} onKeyDown={key} onDblClick={() => onChange(WIDTH.default)} />
	);
}
