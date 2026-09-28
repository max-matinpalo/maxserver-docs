import { useState } from 'preact/hooks';
import { Icon } from './Icon.jsx';
import styles from './CopyButton.module.css';


/**
 * Copies text; shows a check for a moment.
 */
export function CopyButton({ text, label = 'Copy' }) {
	const [done, setDone] = useState(false);

	async function copy() {
		try {
			await navigator.clipboard.writeText(text);
			setDone(true);
			setTimeout(() => setDone(false), 1200);
		} catch {
			// Clipboard blocked (insecure origin): nothing to show
		}
	}

	return (
		<button type="button" class={styles.button} onClick={copy} aria-label={label} title={label}>
			<Icon name={done ? 'check' : 'copy'} size={15} />
		</button>
	);
}
