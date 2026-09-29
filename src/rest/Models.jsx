import { Markdown } from '../docs/Markdown.jsx';
import { SchemaFields } from '../schema/SchemaFields.jsx';
import styles from './Models.module.css';


/**
 * All components.schemas with their fields.
 */
export function Models({ models }) {
	if (!models.length) return null;

	return (
		<section id="models" data-anchor class={styles.models}>
			<h2 class={styles.title}>Models</h2>
			{models.map(m => (
				<article key={m.id} id={m.id} data-anchor class={styles.model}>
					<h3 class={styles.name}>{m.name}</h3>
					<div class={styles.body}>
						<Markdown text={m.schema?.description} muted />
						<SchemaFields schema={m.schema} />
					</div>
				</article>
			))}
		</section>
	);
}
