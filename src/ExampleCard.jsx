import { useContext, useState } from 'preact/hooks';
import { DocContext } from './docContext.js';
import { exampleFor } from './example.js';
import { Tabs } from './ui/Tabs.jsx';
import { Checkbox } from './ui/Checkbox.jsx';
import { CodeBlock } from './ui/CodeBlock.jsx';
import { CopyButton } from './ui/CopyButton.jsx';
import styles from './ExampleCard.module.css';


/**
 * Example JSON per response status, with copy and a raw schema view.
 * A response with its own doc resolves refs in it, like a tool schema.
 */
export function ExampleCard({ responses }) {
	const doc = useContext(DocContext);
	const [status, setStatus] = useState(responses[0]?.status);
	const [showSchema, setShowSchema] = useState(false);
	if (!responses.length) return null;

	const response = responses.find(r => r.status === status) || responses[0];
	const value = response.schema ? (showSchema ? response.schema : exampleFor(response.doc || doc, response.schema)) : null;
	const text = value === null ? '' : JSON.stringify(value, null, 2);

	return (
		<div class={styles.card}>
			<div class={styles.header}>
				<Tabs tabs={responses.map(r => r.status)} active={response.status} onChange={setStatus} label="Response status" />
				<span class={styles.actions}>
					{text && <CopyButton text={text} label="Copy example" />}
					{response.schema && <Checkbox label="Show Schema" checked={showSchema} onChange={setShowSchema} />}
				</span>
			</div>
			<div class={styles.body}>
				{text ? <CodeBlock value={text} /> : <p class={styles.empty}>No body</p>}
			</div>
			{response.description && <div class={styles.footer}>{response.description.split('\n')[0]}</div>}
		</div>
	);
}
