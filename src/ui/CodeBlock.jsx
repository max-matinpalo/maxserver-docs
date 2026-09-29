import { tokenizeJson } from './json.js';
import styles from './CodeBlock.module.css';


/**
 * JSON with colored keys, strings, numbers, and literals.
 */
export function CodeBlock({ value }) {
	const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
	return (
		<pre class={styles.code}>
			<code>
				{tokenizeJson(text).map((t, i) => t.type === 'punct' ? t.text : <span key={i} class={styles[t.type]}>{t.text}</span>)}
			</code>
		</pre>
	);
}
