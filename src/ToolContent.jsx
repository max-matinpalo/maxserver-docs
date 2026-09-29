import { prettyJson, formatSize } from './request.js';
import { resourceBytes } from './mcpView.js';
import { saveResource } from './saveFile.js';
import { CodeBlock } from './ui/CodeBlock.jsx';
import { Button } from './ui/Button.jsx';
import { Icon } from './ui/Icon.jsx';
import styles from './ToolContent.module.css';


/**
 * One content item: text, an image, or an embedded file to save.
 */
function Item({ item }) {
	if (item.type === 'text') {
		const pretty = prettyJson(item.text);
		return pretty === null ? <pre class={styles.text}>{item.text}</pre> : <CodeBlock value={pretty} />;
	}
	if (item.type === 'image') return <img class={styles.image} src={`data:${item.mimeType};base64,${item.data}`} alt="" />;
	if (item.type === 'resource' && item.resource) {
		const { uri, mimeType } = item.resource;
		return (
			<div class={styles.file}>
				<code class={styles.uri}>{uri}</code>
				<span class={styles.meta}>{mimeType} · {formatSize(resourceBytes(item.resource).length)}</span>
				<Button variant="light" onClick={() => saveResource(item.resource)}><Icon name="download" size={12} /> Save</Button>
			</div>
		);
	}
	if (item.type === 'resource_link') return <code class={styles.uri}>{item.uri}</code>;
	return <p class={styles.meta}>{item.type} content</p>;
}


/**
 * The content items of a tool result, the part every client shows.
 */
export function ToolContent({ items }) {
	if (!items.length) return <p class={styles.empty}>No content</p>;
	return (
		<ol class={styles.list}>
			{items.map((item, i) => (
				<li key={i} class={styles.item}>
					<div class={styles.type}>{item.type}</div>
					<Item item={item} />
				</li>
			))}
		</ol>
	);
}
