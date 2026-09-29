import { formatSize } from './http.js';
import styles from './ResponseSummary.module.css';


/**
 * Time, size, and HTTP status of a response, with a dot for the outcome.
 * A note, like Tool error, explains a failure the status does not show.
 */
export function ResponseSummary({ result, ok = result.code < 400, note }) {
	return (
		<div class={styles.summary} aria-live="polite">
			<span>{Math.round(result.time)}ms</span>
			<span>{formatSize(result.size)}</span>
			<span class={styles.status}>{result.code} {result.statusText}</span>
			<span class={`${styles.dot} ${ok ? styles.ok : styles.bad}`} aria-hidden="true" />
			{note && <span class={styles.note}>{note}</span>}
		</div>
	);
}
