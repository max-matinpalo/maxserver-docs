import styles from './McpBar.module.css';


/**
 * The MCP endpoint field; Enter connects, the same path again reloads.
 */
export function McpBar({ path, onSubmit }) {
	const submit = e => {
		e.preventDefault();
		onSubmit(new FormData(e.currentTarget).get('mcp').trim());
	};

	return (
		<form class={styles.bar} onSubmit={submit}>
			<label class={styles.field}>
				<span class={styles.label}>MCP</span>
				<input class={styles.input} name="mcp" defaultValue={path} placeholder="/mcp"
					aria-label="MCP endpoint path or URL" autocomplete="off" spellcheck={false} />
			</label>
		</form>
	);
}
