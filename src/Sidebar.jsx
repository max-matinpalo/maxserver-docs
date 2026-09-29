import { useEffect, useState } from 'preact/hooks';
import { toolId, toolLabel } from './mcp.js';
import { MethodBadge } from './ui/MethodBadge.jsx';
import { SidebarGroup } from './SidebarGroup.jsx';
import styles from './Sidebar.module.css';


/**
 * REST: Introduction, untagged operations, tag groups, and models; the
 * group holding the active section opens by itself.
 * MCP (when mcp is given): Server, then every tool.
 */
export function Sidebar({ model, mcp, activeId, onNavigate }) {
	const [open, setOpen] = useState(() => new Set());

	// 1. Open the group of the active section
	const activeGroup = activeId?.startsWith('model/') ? 'models'
		: model.groups.find(g => activeId === g.id || activeId?.startsWith(`${g.id}/`))?.id;

	useEffect(() => {
		if (activeGroup && !open.has(activeGroup)) setOpen(new Set([...open, activeGroup]));
	}, [activeGroup]);

	const toggle = id => {
		const next = new Set(open);
		next.has(id) ? next.delete(id) : next.add(id);
		setOpen(next);
	};

	const link = (id, label, method) => (
		<li key={id}>
			<a href={`#${id}`} onClick={onNavigate}
				class={`${styles.link} ${id === activeId ? styles.active : ''}`}
				aria-current={id === activeId ? 'location' : undefined}>
				<span class={styles.label}>{label}</span>
				{method && <MethodBadge method={method} short />}
			</a>
		</li>
	);

	// 2. MCP
	if (mcp) {
		const tools = mcp.status === 'ready' ? mcp.server.tools : [];
		return (
			<nav class={styles.sidebar} aria-label="MCP server">
				<ul class={styles.list}>
					{link('mcp', 'Server')}
					{tools.map(t => link(toolId(t), toolLabel(t), 'TOOL'))}
				</ul>
			</nav>
		);
	}

	// 3. REST
	return (
		<nav class={styles.sidebar} aria-label="API reference">
			<ul class={styles.list}>
				{link('introduction', 'Introduction')}
				{model.untagged.map(op => link(op.id, op.label, op.method))}
				{model.groups.map(g => (
					<SidebarGroup key={g.id} title={g.name} open={open.has(g.id)} onToggle={() => toggle(g.id)}
						items={g.operations.map(op => ({ id: op.id, label: op.label, method: op.method }))}
						activeId={activeId} onNavigate={onNavigate} />
				))}
				{model.models.length > 0 && (
					<SidebarGroup title="Models" open={open.has('models')} onToggle={() => toggle('models')}
						items={model.models.map(m => ({ id: m.id, label: m.name }))}
						activeId={activeId} onNavigate={onNavigate} />
				)}
			</ul>
		</nav>
	);
}
