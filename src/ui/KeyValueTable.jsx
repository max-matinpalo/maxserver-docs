import { Icon } from './Icon.jsx';
import styles from './KeyValueTable.module.css';


/**
 * Editable key / value rows, each switchable on and off.
 * An empty last row adds a new row as soon as it is typed into.
 * fixedKeys: keys cannot change and rows cannot be switched off.
 */
export function KeyValueTable({ rows, onChange, fixedKeys = false, label }) {
	const shown = fixedKeys ? rows : [...rows, { key: '', value: '', enabled: false }];

	const update = (i, change) => {
		const next = shown.map((r, j) => j === i ? { ...r, ...change } : r);
		if (!fixedKeys && i === rows.length && ('key' in change || 'value' in change)) next[i].enabled = true;
		onChange(next.filter((r, j) => j < rows.length || r.key || r.value));
	};

	return (
		<table class={styles.table} aria-label={label}>
			<tbody>
				{shown.map((r, i) => (
					<tr key={i}>
						<td class={styles.check}>
							{!fixedKeys && (
								<label class={styles.box}>
									<input type="checkbox" checked={r.enabled} aria-label={`Send ${r.key || 'row'}`}
										onChange={e => update(i, { enabled: e.currentTarget.checked })} />
									<span aria-hidden="true">{r.enabled && <Icon name="check" size={12} />}</span>
								</label>
							)}
						</td>
						<td class={styles.cell}>
							<input class={styles.input} value={r.key} placeholder="Key" readOnly={fixedKeys}
								aria-label="Key" onInput={e => update(i, { key: e.currentTarget.value })} />
						</td>
						<td class={styles.cell}>
							<input class={styles.input} value={r.value} placeholder="Value"
								aria-label={`${r.key || 'Row'} value`} onInput={e => update(i, { value: e.currentTarget.value })} />
						</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}
