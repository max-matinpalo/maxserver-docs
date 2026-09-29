import { useState } from 'preact/hooks';
import { replyError, toolView } from './mcp.js';
import { Tabs } from '../ui/Tabs.jsx';
import { CodeBlock } from '../ui/CodeBlock.jsx';
import { ResponseSummary } from '../docs/ResponseSummary.jsx';
import { ResponseView } from '../docs/ResponseView.jsx';
import { ToolContent } from './ToolContent.jsx';
import { ViewFrame } from './ViewFrame.jsx';
import styles from './ToolResult.module.css';


/**
 * The reply of a tools/call: its outcome, then the view, the structured
 * result, the content items, and the raw HTTP exchange.
 */
export function ToolResult({ tool, session, result }) {
	const [tab, setTab] = useState(null);
	if (result?.state !== 'done') return <ResponseView result={result} />;

	// 1. Outcome: a failed request, a JSON-RPC error, or a tool error with its text
	const error = replyError(result);
	const call = error ? null : result.reply.result;
	const ok = call && !call.isError;
	const message = error?.message || (!ok && (call.content?.find(c => c.type === 'text')?.text || 'The tool failed.'));

	// 2. Tabs: view and structured result only for a successful call
	const tabs = [ok && toolView(tool) && 'View', ok && 'Result', call && 'Content', 'Raw'].filter(Boolean);
	const active = tabs.includes(tab) ? tab : tabs[0];

	return (
		<div>
			<ResponseSummary result={result} ok={ok} note={error ? 'Error' : !ok && 'Tool error'} />
			{message && <p class={styles.error} role="alert">{message}</p>}
			<div class={styles.tabs}><Tabs tabs={tabs} active={active} onChange={setTab} label="Result views" /></div>
			{active === 'View' && <ViewFrame key={result.time} tool={tool} args={result.args} result={call} session={session} />}
			{active === 'Result' && (
				<div class={styles.body}>
					{call.structuredContent !== undefined ? <CodeBlock value={call.structuredContent} /> : <p class={styles.empty}>No structuredContent</p>}
				</div>
			)}
			{active === 'Content' && <ToolContent items={call.content || []} />}
			{active === 'Raw' && <ResponseView result={result} summary={false} />}
		</div>
	);
}
