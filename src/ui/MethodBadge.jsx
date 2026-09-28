import styles from './MethodBadge.module.css';

const SHORT = { DELETE: 'DEL', OPTIONS: 'OPT' };


/**
 * HTTP method in its color. short: DEL instead of DELETE (sidebar).
 * dark: colors for dark backgrounds.
 */
export function MethodBadge({ method, short = false, dark = false }) {
	const m = method.toUpperCase();
	return (
		<span class={`${styles.badge} ${styles[m.toLowerCase()] || ''} ${dark ? styles.dark : ''} ${short ? styles.short : ''}`}>
			{short ? SHORT[m] || m : m}
		</span>
	);
}
