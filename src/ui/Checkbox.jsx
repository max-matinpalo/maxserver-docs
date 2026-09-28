import { Icon } from './Icon.jsx';
import styles from './Checkbox.module.css';


/**
 * Label with a small square checkbox, like "Show Schema".
 */
export function Checkbox({ label, checked, onChange }) {
	return (
		<label class={styles.checkbox}>
			<span>{label}</span>
			<input type="checkbox" checked={checked} onChange={e => onChange(e.currentTarget.checked)} />
			<span class={styles.box} aria-hidden="true">{checked && <Icon name="check" size={12} />}</span>
		</label>
	);
}
