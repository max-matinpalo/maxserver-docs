import { useEffect, useState } from 'preact/hooks';
import { toolGroups, toolId, toolLabel } from './mcp.js';
import { MethodBadge } from './ui/MethodBadge.jsx';
import { SidebarGroup } from './SidebarGroup.jsx';
import styles from './Sidebar.module.css';


/**
 * REST: Introduction, untagged operations, tag groups, and models; the
 * group holding the active section opens by itself.
 * MCP (when mcp is given): Server, then the tool groups.
 */
export function Sidebar({ model, mcp, activeId, onNavigate }) {
	const [open, setOpen] = useState(() => new Set());

	// 1. Open the group of the active section
	const mcpGroups = mcp?.status === 'ready' ? toolGroups(mcp.server.tools) : [];
	const activeGroup = mcp ? mcpGroups.find(g => activeId === g.id || g.tools.some(t => toolId(t) === activeId))?.id
		: activeId?.startsWith('model/') ? 'models'
		: model.groups.find(g => activeId === g.id || activeId?.startsWith(`${g.id}/`))?.id;

	useEffect(() => {
		if (activeGroup && !open.has(activeGroup)) setOpen(new Set([...open, activeGroup]));
	}, [activeGroup]);

	// Opening a group also shows its page
	const toggle = id => {
		const next = new Set(open);
		if (next.has(id)) next.delete(id);
		else {
			next.add(id);
			location.hash = id;
		}
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
		return (
			<nav class={styles.sidebar} aria-label="MCP server">
				<ul class={styles.list}>
					{link('mcp', 'Server')}
					{mcpGroups.map(g => (
						<SidebarGroup key={g.id} title={g.name} open={open.has(g.id)} active={activeGroup === g.id} onToggle={() => toggle(g.id)}
							items={g.tools.map(t => ({ id: toolId(t), label: toolLabel(t), method: 'TOOL' }))}
							activeId={activeId} onNavigate={onNavigate} />
					))}
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
					<SidebarGroup key={g.id} title={g.name} open={open.has(g.id)} active={activeGroup === g.id} onToggle={() => toggle(g.id)}
						items={g.operations.map(op => ({ id: op.id, label: op.label, method: op.method }))}
						activeId={activeId} onNavigate={onNavigate} />
				))}
				{model.models.length > 0 && (
					<SidebarGroup title="Models" open={open.has('models')} active={activeGroup === 'models'} onToggle={() => toggle('models')}
						items={model.models.map(m => ({ id: m.id, label: m.name }))}
						activeId={activeId} onNavigate={onNavigate} />
				)}
			</ul>
		</nav>
	);
}
