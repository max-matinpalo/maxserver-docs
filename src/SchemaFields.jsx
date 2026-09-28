import { useContext } from 'preact/hooks';
import { DocContext } from './docContext.js';
import { describe } from './schema.js';
import { TypeLabel } from './TypeLabel.jsx';
import { NestedFields } from './NestedFields.jsx';
import styles from './SchemaFields.module.css';


/**
 * The fields of a whole schema (body, response, model).
 * Objects list their properties; other types show one type line first.
 */
export function SchemaFields({ schema, showType = false }) {
	const doc = useContext(DocContext);
	if (!schema) return null;
	const info = describe(doc, schema, new Set());
	const isObject = info.type === 'object' && !info.model && !info.items;

	return (
		<div class={styles.fields}>
			{(showType || !isObject) && (
				<div class={styles.type}><TypeLabel info={info} /></div>
			)}
			{(info.inner || info.variants) && <NestedFields info={info} />}
		</div>
	);
}
