import { MethodBadge } from './ui/MethodBadge.jsx';
import { Markdown } from './Markdown.jsx';
import styles from './TagSection.module.css';


/**
 * Start of a tag group: name, description, and its operations
 * (or tools, with cardTitle="Tools").
 */
export function TagSection({ group, cardTitle = 'Operations' }) {
	return (
		<section id={group.id} data-anchor class={styles.tag}>
			<div class={styles.left}>
				<h2 class={styles.title}>{group.name}</h2>
				<Markdown text={group.description} />
			</div>
			<div class={styles.card}>
				<div class={styles.cardTitle}>{cardTitle}</div>
				<ul class={styles.list}>
					{group.operations.map(op => (
						<li key={op.id}>
							<a class={styles.item} href={`#${op.id}`}>
								<span class={styles.method}><MethodBadge method={op.method} /></span>
								<code class={styles.path}>{op.path}</code>
							</a>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
