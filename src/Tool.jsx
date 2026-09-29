import { useState } from 'preact/hooks';
import { DocContext } from './docContext.js';
import { toolHints, toolId, toolLabel, toolView } from './mcp.js';
import { Pill } from './ui/Pill.jsx';
import { Markdown } from './Markdown.jsx';
import { InputSection } from './InputSection.jsx';
import { SchemaFields } from './SchemaFields.jsx';
import { EndpointBar } from './EndpointBar.jsx';
import { ExampleCard } from './ExampleCard.jsx';
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

	return (
		<section id={toolId(tool)} data-anchor class={styles.tool}>
			<div class={styles.left}>
				<h3 class={styles.title}>{toolLabel(tool)}</h3>
				{hints.length > 0 && (
					<div class={styles.pills}>
						{hints.map(hint => <Pill key={hint}>{hint}</Pill>)}
						{view && <code class={styles.view}>{view}</code>}
					</div>
				)}
				<Markdown text={tool.description || ''} />
				<InputSection title="Arguments"><Fields schema={tool.inputSchema} empty="No arguments" /></InputSection>
				<InputSection title="Result"><Fields schema={tool.outputSchema} empty="No outputSchema: the result is its content items" /></InputSection>
			</div>

			<div class={styles.right}>
				<div class={styles.sticky}>
					<EndpointBar method="TOOL" path={tool.name} onTest={() => setTesting(true)} />
					<ExampleCard responses={examples} />
				</div>
			</div>

			{testing && <ToolPanel tool={tool} session={session} onClose={() => setTesting(false)} />}
		</section>
	);
}
