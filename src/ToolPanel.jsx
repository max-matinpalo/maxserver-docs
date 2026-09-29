import { useContext, useState } from 'preact/hooks';
import { ClientContext } from './clientContext.js';
import { post, toolLabel } from './mcp.js';
import { exampleFor } from './example.js';
import { useStored } from './useStored.js';
import { TestPanel } from './ui/TestPanel.jsx';
import { Section } from './ui/Section.jsx';
import { CodeEditor } from './ui/CodeEditor.jsx';
import { AuthField } from './AuthField.jsx';
import { ToolResult } from './ToolResult.jsx';
import styles from './ToolPanel.module.css';


const example = tool => JSON.stringify(exampleFor(tool.inputSchema || {}, tool.inputSchema || {}), null, 2);


/**
 * Test window for one tool: token and JSON arguments left, the
 * tools/call reply right. Sent arguments are remembered per tool.
 */
export function ToolPanel({ tool, session, onClose }) {
	const { token } = useContext(ClientContext);
	const [saved, setSaved] = useStored(`maxserver-docs:args:${tool.name}`);
	const [args, setArgs] = useState(() => saved || example(tool));
	const [invalid, setInvalid] = useState('');
	const [result, setResult] = useState(null);

	async function send() {

		// 1. Arguments: one JSON object
		let parsed;
		try {
			parsed = JSON.parse(args.trim() || '{}');
			if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Arguments must be a JSON object.');
		} catch (err) {
			setInvalid(err.message);
			return;
		}
		setInvalid('');
		setSaved(args);

		// 2. tools/call, as a model calls it
		setResult({ state: 'loading' });
		try {
			const response = await post({ ...session, token }, 'tools/call', { name: tool.name, arguments: parsed });
			setResult({ state: 'done', args: parsed, ...response });
		} catch (err) {
			setResult({ state: 'error', message: err.message });
		}
	}

	const reset = () => {
		setArgs(example(tool));
		setSaved('');
	};

	return (
		<TestPanel label={`Test tool: ${toolLabel(tool)}`} method="TOOL" target={tool.name} copyText={session.url}
			onSend={send} sending={result?.state === 'loading'} onClose={onClose}
			title={toolLabel(tool)} resultTitle="Result" result={<ToolResult tool={tool} session={session} result={result} />}>
			<Section title="Authentication" right="Bearer">
				<AuthField />
			</Section>
			<Section title="Arguments" right="JSON">
				<CodeEditor value={args} onChange={setArgs} label="Arguments" />
				<div class={styles.footer}>
					<span class={styles.invalid} role="alert">{invalid}</span>
					<button type="button" class={styles.reset} onClick={reset}>Reset to example</button>
				</div>
			</Section>
		</TestPanel>
	);
}
