import { MethodBadge } from './ui/MethodBadge.jsx';
import { Button } from './ui/Button.jsx';
import { Icon } from './ui/Icon.jsx';
import styles from './EndpointBar.module.css';


/**
 * Dark bar with method and path (params highlighted) and Test Request.
 */
export function EndpointBar({ method, path, onTest }) {
	const parts = path.split(/(\{[^}]+\})/);
	return (
		<div class={styles.bar}>
			<MethodBadge method={method} dark />
			<code class={styles.path}>
				{parts.map((p, i) => p.startsWith('{') ? <span key={i} class={styles.param}>{p}</span> : p)}
			</code>
			{onTest && (
				<span class={styles.test}>
					<Button variant="light" onClick={onTest}><Icon name="play" size={10} /> Test Request</Button>
				</span>
			)}
		</div>
	);
}
