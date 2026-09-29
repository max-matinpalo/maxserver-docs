import { Markdown } from './Markdown.jsx';
import { AuthField } from './AuthField.jsx';
import { Button } from './ui/Button.jsx';
import { MethodBadge } from './ui/MethodBadge.jsx';
import { toolId } from './mcp.js';
import styles from './McpServer.module.css';


/**
 * Start of the MCP part: what initialize said, the endpoint, Reload,
 * and the tools and resources; while connecting or failing, the reason.
 */
export function McpServer({ state, url, onReload }) {
	const reload = <Button variant="light" onClick={onReload}>Reload</Button>;

	// 1. Connecting or failed
	if (state.status !== 'ready') {
		return (
			<section id="mcp" data-anchor class={styles.server}>
				<div>
					<h2 class={styles.title}>MCP Server</h2>
					<p class={styles.endpoint}><MethodBadge method="POST" /> <code>{url}</code></p>
					{state.status === 'loading' && <p class={styles.muted}>Connecting…</p>}
					{state.status === 'error' && (
						<div role="alert">
							<p class={styles.error}>{state.message}</p>
							{state.unauthorized && <p class={styles.muted}>Paste a Bearer token, like one from a sign-in route above, then Reload.</p>}
							{state.unauthorized && <div class={styles.auth}><AuthField /></div>}
							{reload}
						</div>
					)}
				</div>
			</section>
		);
	}

	// 2. Connected
	const { server, protocolVersion, instructions, tools, resources } = state.server;
	return (
		<section id="mcp" data-anchor class={styles.server}>
			<div>
				<div class={styles.pills}>
					{server.version && <span class={styles.pill}>v{server.version}</span>}
					<span class={styles.pill}>MCP {protocolVersion}</span>
				</div>
				<h2 class={styles.title}>{server.title || server.name || 'MCP Server'}</h2>
				<p class={styles.endpoint}><MethodBadge method="POST" /> <code>{url}</code> {reload}</p>
				<Markdown text={instructions} />
			</div>
			<div class={styles.cards}>
				<div class={styles.card}>
					<div class={styles.cardTitle}>Tools <span class={styles.count}>{tools.length}</span></div>
					<ul class={styles.list}>
						{tools.map(tool => <li key={tool.name}><a href={`#${toolId(tool)}`}><code>{tool.name}</code></a></li>)}
					</ul>
				</div>
				{resources.length > 0 && (
					<div class={styles.card}>
						<div class={styles.cardTitle}>Resources <span class={styles.count}>{resources.length}</span></div>
						<ul class={styles.list}>
							{resources.map(r => <li key={r.uri} title={r.description}><code>{r.uri}</code> <span class={styles.muted}>{r.mimeType}</span></li>)}
						</ul>
					</div>
				)}
			</div>
		</section>
	);
}
