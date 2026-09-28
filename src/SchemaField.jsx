import { useContext } from 'preact/hooks';
import { DocContext } from './docContext.js';
import { describe, metaParts, previewText, ownExample } from './schema.js';
import { Markdown } from './Markdown.jsx';
import { TypeLabel } from './TypeLabel.jsx';
import { NestedFields } from './NestedFields.jsx';
import { Foldable } from './ui/Foldable.jsx';
import styles from './SchemaField.module.css';


/**
 * One field row: name, type, format, constraints, required, example,
 * description, and its nested fields when it has some.
 */
export function SchemaField({ name, schema, required, seen = new Set() }) {
	const doc = useContext(DocContext);
	const info = describe(doc, schema, seen);
	const example = ownExample(info.schema);
	const preview = previewText(info.inner);

	const head = (
		<span class={styles.head}>
			{name && <span class={styles.name}>{name}</span>}
			<TypeLabel info={info} />
			{metaParts(info).map((p, i) => <span key={i} class={styles.meta}>· {p}</span>)}
			{required && <span class={styles.required}>required</span>}
			{example !== undefined && (
				<span class={styles.example} title={JSON.stringify(example, null, 2)}>Example</span>
			)}
			{preview && <span class={styles.preview}>{preview}</span>}
		</span>
	);

	const description = info.schema.description && (
		<div class={styles.description}><Markdown text={info.schema.description} muted /></div>
	);

	// 1. Leaf: one row
	if (!info.inner && !info.variants) {
		return <div class={styles.field}><div class={styles.row}>{head}</div>{description}</div>;
	}

	// 2. Nested: foldable
	return (
		<div class={styles.field}>
			<Foldable title={head} label={`${name || 'value'} fields`}>
				<NestedFields info={info} />
			</Foldable>
			{description}
		</div>
	);
}
