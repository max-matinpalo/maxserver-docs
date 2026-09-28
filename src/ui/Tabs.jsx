import styles from './Tabs.module.css';


/**
 * Tab buttons with an underline on the active one.
 */
export function Tabs({ tabs, active, onChange, label }) {
	return (
		<div class={styles.tabs} role="tablist" aria-label={label}>
			{tabs.map(tab => (
				<button key={tab} type="button" role="tab" aria-selected={tab === active}
					class={`${styles.tab} ${tab === active ? styles.active : ''}`} onClick={() => onChange(tab)}>
					{tab}
				</button>
			))}
		</div>
	);
}
