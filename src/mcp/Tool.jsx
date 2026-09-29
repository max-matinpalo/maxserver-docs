import { useState } from 'preact/hooks';
import { DocContext } from '../contexts.js';
import { toolHints, toolId, toolLabel, toolView } from './mcp.js';
import { Pill } from '../ui/Pill.jsx';
import { Markdown } from '../docs/Markdown.jsx';
import { InputSection } from '../docs/InputSection.jsx';
import { SchemaFields } from '../schema/SchemaFields.jsx';
import { EndpointBar } from '../docs/EndpointBar.jsx';
import { ExampleCard } from '../docs/ExampleCard.jsx';
import { Entry } from '../docs/Entry.jsx';
import { ToolPanel } from './ToolPanel.jsx';
import styles from './Tool.module.css';


/**
 * The fields of a tool schema; its refs resolve inside the schema itself.
 */
function Fields({ schema, empty }) {
	if (!schema?.properties || !Object.keys(schema.properties).length) return <p class={styles.empty}>{empty}</p>;
	return (
		<DocContext.Provider value={schema}>
			<SchemaFields schema={schema} />
		</DocContext.Provider>
	);
}


/**
 * One MCP tool from tools/list: description, arguments, and result left;
 * name bar and examples right.
 */
export function Tool({ tool, session }) {
	const [testing, setTesting] = useState(false);
	const view = toolView(tool);
	const hints = toolHints(tool);
	const examples = [
		{ status: 'Arguments', schema: tool.inputSchema, doc: tool.inputSchema },
		...(tool.outputSchema ? [{ status: 'Result', schema: tool.outputSchema, doc: tool.outputSchema, description: 'structuredContent' }] : []),
	];

	const aside = (
		<>
			<EndpointBar method="TOOL" path={tool.name} onTest={() => setTesting(true)} />
			<ExampleCard responses={examples} />
		</>
	);

	return (
		<Entry id={toolId(tool)} title={toolLabel(tool)} aside={aside} panel={testing && <ToolPanel tool={tool} session={session} onClose={() => setTesting(false)} />}>
			{hints.length > 0 && (
				<div class={styles.pills}>
					{hints.map(hint => <Pill key={hint}>{hint}</Pill>)}
					{view && <code class={styles.view}>{view}</code>}
				</div>
			)}
			<Markdown text={tool.description || ''} />
			<InputSection title="Arguments"><Fields schema={tool.inputSchema} empty="No arguments" /></InputSection>
			<InputSection title="Result"><Fields schema={tool.outputSchema} empty="No outputSchema: the result is its content items" /></InputSection>
		</Entry>
	);
}
