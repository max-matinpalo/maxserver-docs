import { MethodBadge } from '../ui/MethodBadge.jsx';
import styles from './SidebarLink.module.css';


/**
 * One sidebar entry: label and optional method badge, highlighted while in
 * view. nested: inside a group, indented past its guide line.
 */
export function SidebarLink({ id, label, method, activeId, nested = false, onNavigate }) {
	return (
		<li>
			<a href={`#${id}`} onClick={onNavigate}
				class={`${styles.link} ${nested ? styles.nested : ''} ${id === activeId ? styles.active : ''}`}
				aria-current={id === activeId ? 'location' : undefined}>
				<span class={styles.label}>{label}</span>
				{method && <MethodBadge method={method} short />}
			</a>
		</li>
	);
}
