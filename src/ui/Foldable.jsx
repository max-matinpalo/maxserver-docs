import { useState } from 'preact/hooks';
import { Icon } from './Icon.jsx';
import styles from './Foldable.module.css';


/**
 * A row that opens and closes its children, with +/– in the left gutter.
 * The +/– is the button; clicking elsewhere on the row toggles too,
 * except on links inside the title.
 * title, right: row content and its right end; either may be a
 * function of the open state.
 * tall: 36px rows, like response rows.
 */
export function Foldable({ title, right, children, defaultOpen = false, label, tall = false }) {
	const [open, setOpen] = useState(defaultOpen);
	const toggle = () => setOpen(!open);
	const onRowClick = e => { if (!e.target.closest('a, button')) toggle(); };

	return (
		<div class={styles.foldable}>
			<div class={`${styles.row} ${tall ? styles.tall : ''}`} onClick={onRowClick}>
				<button type="button" class={styles.toggle} aria-expanded={open} aria-label={label} onClick={toggle}>
					<Icon name={open ? 'minus' : 'plus'} size={14} />
				</button>
				<span class={styles.title}>{typeof title === 'function' ? title(open) : title}</span>
				{right && <span class={styles.right}>{typeof right === 'function' ? right(open) : right}</span>}
			</div>
			{open && <div class={styles.body}>{children}</div>}
		</div>
	);
}
