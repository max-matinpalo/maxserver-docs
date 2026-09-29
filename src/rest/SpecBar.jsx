import { readRecent } from './recentSpecs.js';
import styles from './SpecBar.module.css';


/**
 * Field to open another spec URL; suggests the last used ones.
 */
export function SpecBar({ url }) {
	const submit = e => {
		e.preventDefault();
		const value = new FormData(e.currentTarget).get('spec').trim();
		if (value) location.assign(`?spec=${encodeURIComponent(value)}`);
	};

	return (
		<form class={styles.bar} onSubmit={submit}>
			<input class={styles.input} name="spec" type="url" defaultValue={url} list="maxserver-docs-recent-specs"
				aria-label="OpenAPI spec URL" placeholder="https://…/openapi.json" spellcheck={false} />
			<datalist id="maxserver-docs-recent-specs">
				{readRecent().map(u => <option key={u} value={u} />)}
			</datalist>
		</form>
	);
}
