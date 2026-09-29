import { useEffect, useState } from 'preact/hooks';
import { readSpec } from './spec.js';
import { DocContext } from './docContext.js';
import { ClientContext } from './clientContext.js';
import { serverBase } from './request.js';
import { mcpUrl, toolGroups, toolId } from './mcp.js';
import { useStored } from './useStored.js';
import { useMcp } from './useMcp.js';
import { useAppearance } from './useAppearance.js';
import { useHash } from './useHash.js';
import { isMcpLink, mcpPage, pageList, restPage } from './pages.js';
import { ThemeContext } from './themeContext.js';
import { rememberSpec } from './recentSpecs.js';
import { SpecBar } from './SpecBar.jsx';
import { McpBar } from './McpBar.jsx';
import { useActiveSection } from './useActiveSection.js';
import { Icon } from './ui/Icon.jsx';
import { Segmented } from './ui/Segmented.jsx';
import { Sidebar } from './Sidebar.jsx';
import { SidebarFooter } from './SidebarFooter.jsx';
import { SidebarResizer } from './SidebarResizer.jsx';
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
 * and one page of content, never both.
 */
export function App({ url, specField = true }) {
	const [state, setState] = useState({ status: 'loading' });
	const [menuOpen, setMenuOpen] = useState(false);
	const appearance = useAppearance();
	const [token, setToken] = useStored('maxserver-docs:token');
	const hash = useHash();
	const [savedMode, saveMode] = useStored('maxserver-docs:mode');
	const [savedPath, setMcpPath] = useStored('maxserver-docs:mcp');
	const mcpPath = savedPath || '/mcp';

	// A link decides the mode, else the last choice; MCP connects the first
	// time it is shown, then keeps its lists
	const mode = hash ? (isMcpLink(hash) ? 'mcp' : 'rest') : savedMode || 'rest';
	const [mcpShown, setMcpShown] = useState(mode === 'mcp');
	useEffect(() => { if (mode === 'mcp') setMcpShown(true); }, [mode]);
	const endpoint = state.status === 'ready' && mcpShown ? mcpUrl(serverBase(state.doc, url), mcpPath) : '';
	const [mcp, reloadMcp] = useMcp(endpoint, token);

	// The one page the link shows
	const groups = mcp.status === 'ready' ? toolGroups(mcp.server.tools) : [];
	const page = state.status !== 'ready' ? '' : mode === 'mcp' ? mcpPage(hash, groups) : restPage(hash, state.model);

	// Arrows past a page's edge open the next page at its top, or the previous at its last section
	const toNeighbor = step => {
		const pages = pageList(mode, state.model, groups);
		const next = pages[pages.findIndex(p => p.id === page) + step];
		if (next) location.hash = step > 0 ? next.id : next.last;
	};
	const activeId = useActiveSection(state.status === 'ready', `${mode}/${mcp.status}/${page}`, hash, toNeighbor);

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
	const restGroup = model.groups.find(g => g.id === page);
	const mcpGroup = groups.find(g => g.id === page);

	// A switch opens the first page of the other docs
	const switchMode = next => {
		saveMode(next === 'mcp' ? 'mcp' : '');
		location.hash = next === 'mcp' ? 'mcp' : 'introduction';
	};

	// A submitted MCP path connects (or reconnects) and shows the server page
	const submitMcp = path => {
		(path || '/mcp') === mcpPath ? reloadMcp() : setMcpPath(path);
		location.hash = 'mcp';
		scrollTo(0, 0);
	};

	return (
		<ThemeContext.Provider value={appearance.shown}>
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
					<SidebarFooter appearance={appearance} />
					<SidebarResizer width={appearance.width} zoom={appearance.zoom} onChange={appearance.setWidth} />
				</aside>
				{menuOpen && <div class={styles.backdrop} onClick={closeMenu} />}

				<main class={styles.content}>
					{page === 'introduction' && <Introduction info={model.info} openapi={model.openapi} url={url} auth={model.operations.some(op => op.auth)} />}
					{page === 'introduction' && model.untagged.map(op => <Operation key={op.id} op={op} />)}
					{restGroup && <TagSection group={restGroup} />}
					{restGroup?.operations.map(op => <Operation key={op.id} op={op} />)}
					{page === 'models' && <Models models={model.models} />}

					{page === 'mcp' && <McpServer state={mcp} url={endpoint} onReload={reloadMcp} />}
					{mcpGroup && <TagSection cardTitle="Tools" group={{ id: mcpGroup.id, name: mcpGroup.name, operations: mcpGroup.tools.map(t => ({ id: toolId(t), method: 'TOOL', path: t.name })) }} />}
					{mcpGroup?.tools.map(tool => <Tool key={tool.name} tool={tool} session={mcp.server.session} />)}
				</main>
			</div>
		</ClientContext.Provider>
		</DocContext.Provider>
		</ThemeContext.Provider>
	);
}
