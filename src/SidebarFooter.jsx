import { useState } from 'preact/hooks';
import { Icon } from './ui/Icon.jsx';
import { SettingsDialog } from './SettingsDialog.jsx';
import styles from './SidebarFooter.module.css';


/**
 * The light and dark toggle, and the settings button.
 */
export function SidebarFooter({ appearance }) {
	const [settings, setSettings] = useState(false);
	const next = appearance.shown === 'dark' ? 'light' : 'dark';

	return (
		<div class={styles.footer}>
			<button type="button" class={styles.toggle} onClick={() => appearance.setTheme(next)}>
				<Icon name={next === 'dark' ? 'moon' : 'sun'} size={15} />
				{next === 'dark' ? 'Dark mode' : 'Light mode'}
			</button>
			<button type="button" class={styles.icon} aria-label="Settings" title="Settings" onClick={() => setSettings(true)}>
				<Icon name="settings" size={16} />
			</button>
			{settings && <SettingsDialog appearance={appearance} onClose={() => setSettings(false)} />}
		</div>
	);
}
