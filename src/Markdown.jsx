import { parseMarkdown } from './markdown.js';
import styles from './Markdown.module.css';


/**
 * Inline nodes as Preact elements.
 */
function inline(nodes) {
	return nodes.map((n, i) => {
		if (n.type === 'text') return n.text;
		if (n.type === 'code') return <code key={i} class={styles.code}>{n.text}</code>;
		if (n.type === 'strong') return <strong key={i}>{inline(n.children)}</strong>;
		if (n.type === 'em') return <em key={i}>{inline(n.children)}</em>;
		const external = /^https?:/.test(n.href);
		return (
			<a key={i} href={n.href} class={styles.link} {...(external && { target: '_blank', rel: 'noopener noreferrer' })}>
				{inline(n.children)}
			</a>
		);
	});
}


/**
 * Renders description Markdown without innerHTML.
 */
export function Markdown({ text, muted = false }) {
	if (!text) return null;
	return (
		<div class={`${styles.markdown} ${muted ? styles.muted : ''}`}>
			{parseMarkdown(text).map((b, i) => {
				if (b.type === 'paragraph') return <p key={i}>{inline(b.children)}</p>;
				if (b.type === 'heading') return <p key={i} class={styles.heading}>{inline(b.children)}</p>;
				if (b.type === 'codeblock') return <pre key={i} class={styles.pre}>{b.text}</pre>;
				const List = b.ordered ? 'ol' : 'ul';
				return <List key={i}>{b.items.map((item, j) => <li key={j}>{inline(item)}</li>)}</List>;
			})}
		</div>
	);
}
