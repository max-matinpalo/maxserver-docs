import { ZOOM, zoomSupported } from './appearance.js';
import { Dialog } from '../ui/Dialog.jsx';
import { Segmented } from '../ui/Segmented.jsx';
import styles from './SettingsDialog.module.css';

const THEMES = [['auto', 'Auto'], ['light', 'Light'], ['dark', 'Dark']];


/**
 * Theme and zoom, remembered in localStorage.
 */
export function SettingsDialog({ appearance, onClose }) {
	const { theme, zoom, setTheme, setZoom } = appearance;

	return (
		<Dialog label="Settings" onClose={onClose} small>
			<div class={styles.settings}>
				<h2 class={styles.title}>Settings</h2>

				<div class={styles.row}>
					<span class={styles.label}>Theme</span>
					<Segmented options={THEMES} value={theme} onChange={setTheme} label="Theme" />
				</div>

				<div class={styles.row}>
					<label class={styles.label} for="maxserver-docs-zoom">Zoom</label>
					{zoomSupported() ? (
						<div class={styles.zoom}>
							<input class={styles.range} type="range" min={ZOOM.min} max={ZOOM.max} step={1} value={zoom}
								aria-label="Zoom" onInput={e => setZoom(e.currentTarget.value)} />
							<input id="maxserver-docs-zoom" class={styles.number} type="number" min={ZOOM.min} max={ZOOM.max} step={1} value={zoom}
								onChange={e => setZoom(e.currentTarget.value)} />
							<span class={styles.unit}>%</span>
							<button type="button" class={styles.reset} disabled={zoom === ZOOM.default} onClick={() => setZoom(ZOOM.default)}>Reset</button>
						</div>
					) : (
						<p class={styles.note}>This browser cannot zoom the page here; use its own zoom.</p>
					)}
				</div>
			</div>
		</Dialog>
	);
}
