import styles from './Segmented.module.css';


/**
 * A row of mutually exclusive options, like REST API and MCP.
 * options: [[value, label]]
 */
export function Segmented({ options, value, onChange, label }) {
	return (
		<div class={styles.segmented} role="radiogroup" aria-label={label}>
			{options.map(([key, text]) => (
				<button key={key} type="button" role="radio" aria-checked={key === value}
					class={`${styles.option} ${key === value ? styles.active : ''}`} onClick={() => onChange(key)}>
					{text}
				</button>
			))}
		</div>
	);
}
