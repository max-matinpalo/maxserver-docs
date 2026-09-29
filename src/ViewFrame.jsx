import { useContext, useEffect, useRef, useState } from 'preact/hooks';
import { ClientContext } from './clientContext.js';
import { ThemeContext } from './themeContext.js';
import { request, toolView } from './mcp.js';
import { viewDocument, resourceText } from './mcpView.js';
import { saveResource } from './saveFile.js';
import styles from './ViewFrame.module.css';

const HOST_INFO = { name: 'maxserver-docs', version: '3' };
const PASSED = ['tools/call', 'resources/read'];


/**
 * The tool's ui:// view with its result, as an MCP Apps host shows it:
 * a sandboxed iframe speaking JSON-RPC over postMessage.
 */
export function ViewFrame({ tool, args, result, session }) {
	const { token } = useContext(ClientContext);
	const theme = useContext(ThemeContext);
	const frame = useRef(null);
	const [view, setView] = useState({ status: 'loading' });
	const [height, setHeight] = useState(160);
	const [log, setLog] = useState([]);
	const uri = toolView(tool);
	const add = line => setLog(lines => [line, ...lines].slice(0, 50));
	const post = message => frame.current?.contentWindow?.postMessage({ jsonrpc: '2.0', ...message }, '*');

	// 1. The view's HTML, with the CSP its resource declares
	useEffect(() => {
		let current = true;
		request({ ...session, token }, 'resources/read', { uri })
			.then(({ result: read }) => {
				const content = read.contents?.find(c => c.uri === uri) || read.contents?.[0];
				if (!content) throw new Error(`${uri} has no contents.`);
				if (current) setView({ status: 'ready', html: viewDocument(resourceText(content), content._meta?.ui?.csp) });
			})
			.catch(err => current && setView({ status: 'error', message: err.message }));
		return () => { current = false; };
	}, [uri]);

	// 2. A theme switch reaches an open view
	useEffect(() => post({ method: 'ui/notifications/host-context-changed', params: { theme } }), [theme]);

	// 3. The host side: answer the view's requests
	useEffect(() => {
		const answer = (id, value) => post({ id, result: value });

		async function handle({ id, method, params = {} }) {
			if (method === 'ui/initialize') {
				return answer(id, {
					protocolVersion: params.protocolVersion,
					hostInfo: HOST_INFO,
					hostCapabilities: { serverTools: {}, serverResources: {}, openLinks: {}, downloadFile: {}, logging: {} },
					hostContext: { theme, displayMode: 'inline', availableDisplayModes: ['inline'], platform: 'web', toolInfo: { tool } },
				});
			}
			if (method === 'ui/notifications/initialized') {
				post({ method: 'ui/notifications/tool-input', params: { arguments: args } });
				return post({ method: 'ui/notifications/tool-result', params: result });
			}
			if (method === 'ui/notifications/size-changed') return params.height > 0 && setHeight(Math.ceil(params.height));

			// Server calls go to the MCP server with the docs' token
			if (PASSED.includes(method)) {
				const what = `${method} ${params.name || params.uri || ''}`;
				try {
					const reply = await request({ ...session, token }, method, params);
					add(`${what}: ${reply.result?.isError ? 'tool error' : 'ok'}`);
					return answer(id, reply.result);
				} catch (err) {
					add(`${what}: ${err.message}`);
					return post({ id, error: { code: -32603, message: err.message } });
				}
			}
			if (method === 'ui/open-link') {
				if (/^https?:\/\//i.test(params.url)) window.open(params.url, '_blank', 'noopener,noreferrer');
				add(`open-link ${params.url}`);
				return answer(id, {});
			}
			if (method === 'ui/download-file') {
				for (const item of params.contents || []) if (item.resource) saveResource(item.resource);
				add(`download-file ${(params.contents || []).map(c => c.resource?.uri || c.uri).join(', ')}`);
				return answer(id, {});
			}
			if (method === 'ui/message') {
				add(`message: ${(params.content || []).map(c => c.text).join(' ')}`);
				return answer(id, {});
			}
			if (method === 'ui/update-model-context' || method === 'notifications/message') {
				add(`${method}: ${JSON.stringify(params).slice(0, 200)}`);
				return id !== undefined && answer(id, {});
			}
			if (method === 'ui/request-display-mode') return answer(id, { mode: 'inline' });

			// Anything else: a request is refused, a notification only logged
			add(`unsupported ${method}`);
			if (id !== undefined) post({ id, error: { code: -32601, message: `Method not found: ${method}` } });
		}

		const onMessage = event => {
			if (!frame.current || event.source !== frame.current.contentWindow) return;
			if (event.data?.jsonrpc === '2.0' && typeof event.data.method === 'string') handle(event.data);
		};
		addEventListener('message', onMessage);
		return () => removeEventListener('message', onMessage);
	}, [view, token, theme]);

	if (view.status === 'loading') return <p class={styles.note}>Loading {uri}…</p>;
	if (view.status === 'error') return <p class={styles.error} role="alert">The view could not be loaded: {view.message}</p>;

	return (
		<div>
			<iframe ref={frame} class={styles.frame} style={{ height: `${height}px` }} title={`View ${uri}`}
				sandbox="allow-scripts" srcdoc={view.html} />
			<div class={styles.uri}>{uri}</div>
			{log.length > 0 && (
				<ol class={styles.log} aria-label="View requests">
					{log.map((line, i) => <li key={log.length - i}>{line}</li>)}
				</ol>
			)}
		</div>
	);
}
