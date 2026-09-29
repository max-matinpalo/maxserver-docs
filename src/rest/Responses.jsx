import { Foldable } from '../ui/Foldable.jsx';
import { Pill } from '../ui/Pill.jsx';
import { Markdown } from '../docs/Markdown.jsx';
import { SchemaFields } from '../schema/SchemaFields.jsx';
import styles from './Responses.module.css';


/**
 * One foldable row per status code; open rows show the response fields.
 */
export function Responses({ responses }) {
	if (!responses.length) return null;

	return (
		<section class={styles.responses}>
			<h4 class={styles.title}>Responses</h4>
			{responses.map(r => (
				<div key={r.status} class={styles.response}>
					<Foldable
						tall
						label={`Response ${r.status}`}
						title={open => (
							<span class={styles.head}>
								<span class={styles.status}>{r.status}</span>
								{!open && <span class={styles.summary}>{r.description.split('\n')[0]}</span>}
							</span>
						)}
						right={open => open && r.contentType && <Pill>{r.contentType}</Pill>}
					>
						<div class={styles.description}><Markdown text={r.description} muted /></div>
						{r.schema ? <SchemaFields schema={r.schema} showType /> : <p class={styles.empty}>No body</p>}
					</Foldable>
				</div>
			))}
		</section>
	);
}
