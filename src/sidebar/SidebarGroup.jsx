import { Icon } from '../ui/Icon.jsx';
import { SidebarLink } from './SidebarLink.jsx';
import styles from './SidebarGroup.module.css';


/**
 * A foldable sidebar group: tag operations, tools, or models.
 * active: the section in view is in this group; its title shows heavier.
 * items: [{ id, label, method? }]
 */
export function SidebarGroup({ title, items, open, active = false, onToggle, activeId, onNavigate }) {
	return (
		<li class={styles.group}>
			<button type="button" class={`${styles.header} ${active ? styles.current : ''}`} aria-expanded={open} onClick={onToggle}>
				<span>{title}</span>
				<Icon name={open ? 'chevronDown' : 'chevronRight'} size={14} class={styles.chevron} />
			</button>
			{open && (
				<ul class={styles.items}>
					{items.map(item => <SidebarLink key={item.id} {...item} activeId={activeId} nested onNavigate={onNavigate} />)}
				</ul>
			)}
		</li>
	);
}
