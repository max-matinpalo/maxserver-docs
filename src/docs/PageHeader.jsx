import styles from './PageHeader.module.css';


/**
 * A page's opening: small pills like the version, then its title.
 * as: the heading element, h1 for the page of the whole API.
 */
export function PageHeader({ pills = [], title, as: Heading = 'h2' }) {
	const shown = pills.filter(Boolean);
	return (
		<>
			{shown.length > 0 && <div class={styles.pills}>{shown.map(p => <span key={p} class={styles.pill}>{p}</span>)}</div>}
			<Heading class={styles.title}>{title}</Heading>
		</>
	);
}
