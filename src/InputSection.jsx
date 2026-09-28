import styles from './InputSection.module.css';


/**
 * A titled block of fields, like "Body" or "Query Parameters",
 * with badges at the right of its title.
 */
export function InputSection({ title, badges, children }) {
	return (
		<section class={styles.section}>
			<header class={styles.header}>
				<h4 class={styles.title}>{title}</h4>
				{badges && <span class={styles.badges}>{badges}</span>}
			</header>
			<div class={styles.fields}>{children}</div>
		</section>
	);
}
