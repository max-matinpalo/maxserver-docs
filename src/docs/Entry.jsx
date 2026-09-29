import styles from './Entry.module.css';


/**
 * One documented entry, a route or a tool: title and details left; the
 * sticky aside right, like the name bar and example; its test panel when open.
 */
export function Entry({ id, title, aside, panel, children }) {
	return (
		<section id={id} data-anchor class={styles.entry}>
			<div class={styles.left}>
				<h3 class={styles.title}>{title}</h3>
				{children}
			</div>

			<div class={styles.right}>
				<div class={styles.sticky}>{aside}</div>
			</div>

			{panel}
		</section>
	);
}
