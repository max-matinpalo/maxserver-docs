import { useState } from 'preact/hooks';
import { Icon } from './Icon.jsx';
import styles from './Section.module.css';


/**
 * Collapsible block with a gray header row: title, note, right text.
 */
export function Section({ title, note, right, defaultOpen = true, children }) {
	const [open, setOpen] = useState(defaultOpen);

	return (
		<section class={styles.section}>
			<h3 class={styles.heading}>
				<button type="button" class={styles.header} aria-expanded={open} onClick={() => setOpen(!open)}>
					<Icon name={open ? 'chevronDown' : 'chevronRight'} size={12} class={styles.chevron} />
					<span class={styles.title}>{title}</span>
					{note !== undefined && <span class={styles.note}>{note}</span>}
					{right && <span class={styles.right}>{right}</span>}
				</button>
			</h3>
			{open && <div class={styles.body}>{children}</div>}
		</section>
	);
}
