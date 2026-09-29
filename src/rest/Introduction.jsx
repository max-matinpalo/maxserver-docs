import { Markdown } from '../docs/Markdown.jsx';
import { AuthField } from '../docs/AuthField.jsx';
import styles from './Introduction.module.css';


/**
 * API title, versions, description, the spec download, and the
 * Bearer token used by test requests (when any route needs auth).
 */
export function Introduction({ info, openapi, url, auth }) {
	return (
		<section id="introduction" data-anchor class={styles.intro}>
			<div class={styles.left}>
				<div class={styles.pills}>
					{info.version && <span class={styles.pill}>v{info.version}</span>}
					<span class={styles.pill}>OpenAPI {openapi}</span>
				</div>
				<h1 class={styles.title}>{info.title}</h1>
				<Markdown text={info.description} />
				<a class={styles.download} href={url} download="openapi.json">Download OpenAPI Document</a>
			</div>
			{auth && (
				<div class={styles.auth}>
					<div class={styles.authTitle}>Authentication</div>
					<AuthField />
				</div>
			)}
		</section>
	);
}
