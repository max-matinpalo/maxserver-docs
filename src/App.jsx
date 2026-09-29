import { useEffect, useState } from 'preact/hooks';
import { readSpec } from './spec.js';
import { DocContext } from './docContext.js';
import { ClientContext } from './clientContext.js';
import { serverBase } from './request.js';
import { mcpUrl, toolGroups, toolId } from './mcp.js';
import { useStored } from './useStored.js';
import { useMcp } from './useMcp.js';
import { rememberSpec } from './recentSpecs.js';
import { SpecBar } from './SpecBar.jsx';
import { McpBar } from './McpBar.jsx';
import { useActiveSection } from './useActiveSection.js';
import { Icon } from './ui/Icon.jsx';
import { Segmented } from './ui/Segmented.jsx';
import { Sidebar } from './Sidebar.jsx';
import { Introduction } from './Introduction.jsx';
import { TagSection } from './TagSection.jsx';
import { Operation } from './Operation.jsx';
import { McpServer } from './McpServer.jsx';
import { Tool } from './Tool.jsx';
import { Models } from './Models.jsx';
import styles from './App.module.css';


const MODES = [['rest', 'REST API'], ['mcp', 'MCP']];


/**
 * Loads the spec and renders the REST API or the MCP server: sidebar
 * and content, never both.
 */
export function App({ url, specField = true }) {
	const [state, setState] = useState({ status: 'loading' });
	const [menuOpen, setMenuOpen] = useState(false);
	const [token, setToken] = useStored('maxserver-docs:token');
	const [savedMode, saveMode] = useStored('maxserver-docs:mode');
	// A link decides the mode, else the last choice
	const [mode, setMode] = useState(() => location.hash ? (location.hash.startsWith('#mcp') ? 'mcp' : 'rest') : savedMode || 'rest');
	const [mcpShown, setMcpShown] = useState(mode === 'mcp');
	const [savedPath, setMcpPath] = useStored('maxserver-docs:mcp');
	const mcpPath = savedPath || '/mcp';

	// MCP connects the first time it is shown, then keeps its lists
	const endpoint = state.status === 'ready' && mcpShown ? mcpUrl(serverBase(state.doc, url), mcpPath) : '';
	const [mcp, reloadMcp] = useMcp(endpoint, token);
	const activeId = useActiveSection(state.status === 'ready', `${mode}/${mcp.status}`);

	// 1. Load
	useEffect(() => {
		fetch(url)
			.then(r => {
				if (!r.ok) throw new Error(`Could not load ${url} (HTTP ${r.status}).`);
				return r.json().catch(() => { throw new Error(`${url} is not valid JSON.`); });
			})
			.then(doc => {
				const model = readSpec(doc);
				rememberSpec(url);
				document.title = `${model.info.title} – API Docs`;
				setState({ status: 'ready', doc, model });
			})
			.catch(err => setState({ status: 'error', message: err.message }));
	}, [url]);

	if (state.status === 'loading') return <p class={styles.message}>Loading API docs…</p>;
	if (state.status === 'error') {
		return (
			<div class={styles.message} role="alert">
				<strong>The API docs could not be shown.</strong>
				<p>{state.message}</p>
				{specField && <SpecBar url={url} />}
			</div>
		);
	}

	// 2. Render
	const { doc, model } = state;
	const closeMenu = () => setMenuOpen(false);

	const client = { base: serverBase(doc, url), token, setToken };
	const groups = mcp.status === 'ready' ? toolGroups(mcp.server.tools) : [];

	// A switch starts the other docs at their top
	const switchMode = next => {
		setMode(next);
		saveMode(next === 'mcp' ? 'mcp' : '');
		if (next === 'mcp') setMcpShown(true);
		history.replaceState(null, '', `#${next === 'mcp' ? 'mcp' : 'introduction'}`);
		scrollTo(0, 0);
	};

	// A submitted MCP path connects (or reconnects) and shows its section
	const submitMcp = path => {
		(path || '/mcp') === mcpPath ? reloadMcp() : setMcpPath(path);
		setTimeout(() => document.getElementById('mcp')?.scrollIntoView({ behavior: 'instant', block: 'start' }));
	};

	return (
		<DocContext.Provider value={doc}>
		<ClientContext.Provider value={client}>
			<div class={styles.app}>
				<header class={styles.topbar}>
					<button type="button" class={styles.menuButton} aria-label={menuOpen ? 'Close menu' : 'Open menu'}
						aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
						<Icon name={menuOpen ? 'close' : 'menu'} size={18} />
					</button>
					<span class={styles.topbarTitle}>{model.info.title}</span>
				</header>

				<aside class={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ''}`}>
					<div class={styles.mode}><Segmented options={MODES} value={mode} onChange={switchMode} label="Documentation" /></div>
					{mode === 'rest' && specField && <SpecBar url={url} />}
					{mode === 'mcp' && <McpBar path={mcpPath} onSubmit={submitMcp} />}
					<Sidebar model={model} mcp={mode === 'mcp' ? mcp : null} activeId={activeId} onNavigate={closeMenu} />
				</aside>
				{menuOpen && <div class={styles.backdrop} onClick={closeMenu} />}

				{mode === 'rest' ? (
					<main class={styles.content}>
						<Introduction info={model.info} openapi={model.openapi} url={url} auth={model.operations.some(op => op.auth)} />
						{model.untagged.map(op => <Operation key={op.id} op={op} />)}
						{model.groups.map(g => (
							<div key={g.id}>
								<TagSection group={g} />
								{g.operations.map(op => <Operation key={op.id} op={op} />)}
							</div>
						))}
						<Models models={model.models} />
					</main>
				) : (
					<main class={styles.content}>
						<McpServer state={mcp} url={endpoint} onReload={reloadMcp} />
						{groups.map(g => (
							<div key={g.id}>
								<TagSection cardTitle="Tools" group={{ id: g.id, name: g.name, operations: g.tools.map(t => ({ id: toolId(t), method: 'TOOL', path: t.name })) }} />
								{g.tools.map(tool => <Tool key={tool.name} tool={tool} session={mcp.server.session} />)}
							</div>
						))}
					</main>
				)}
			</div>
		</ClientContext.Provider>
		</DocContext.Provider>
	);
}
