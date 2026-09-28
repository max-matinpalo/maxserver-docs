import { useContext, useState } from 'preact/hooks';
import { DocContext } from './docContext.js';
import { ClientContext } from './clientContext.js';
import { initialInputs, buildRequest, buildUrl, statusText } from './request.js';
import { Dialog } from './ui/Dialog.jsx';
import { Section } from './ui/Section.jsx';
import { KeyValueTable } from './ui/KeyValueTable.jsx';
import { MethodBadge } from './ui/MethodBadge.jsx';
import { CopyButton } from './ui/CopyButton.jsx';
import { Button } from './ui/Button.jsx';
import { Icon } from './ui/Icon.jsx';
import { AuthField } from './AuthField.jsx';
import { ResponseView } from './ResponseView.jsx';
import styles from './RequestPanel.module.css';

const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);


/**
 * Test request window for one operation: inputs left, response right.
 */
export function RequestPanel({ op, onClose }) {
	const doc = useContext(DocContext);
	const { base, token } = useContext(ClientContext);
	const [inputs, setInputs] = useState(() => initialInputs(doc, op));
	const [result, setResult] = useState(null);
	const set = key => value => setInputs({ ...inputs, [key]: value });

	const url = buildUrl(base, op.path, inputs.path, inputs.query);
	const shownUrl = url.startsWith(base) ? url.slice(base.length) || '/' : url;

	async function send() {

		// 1. Build and send
		const req = buildRequest({ op, base, inputs, token });
		setResult({ state: 'loading' });
		const start = performance.now();

		try {
			const res = await fetch(req.url, { method: req.method, headers: req.headers, body: req.body, credentials: 'include' });
			const buffer = await res.arrayBuffer();

			// 2. Keep what the response view shows
			setResult({
				state: 'done',
				code: res.status,
				statusText: statusText(res.status, res.statusText),
				time: performance.now() - start,
				size: buffer.byteLength,
				text: new TextDecoder().decode(buffer),
				contentType: res.headers.get('content-type') || '',
				requestHeaders: req.headers,
				responseHeaders: [...res.headers],
			});
		} catch (err) {
			setResult({ state: 'error', message: err.message });
		}
	}

	const keyDown = e => {
		if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			send();
		}
	};

	return (
		<Dialog label={`Test request: ${op.label}`} onClose={onClose} onKeyDown={keyDown}>
			<header class={styles.top}>
				<div class={styles.urlBar}>
					<span class={styles.method}><MethodBadge method={op.method} /></span>
					<span class={styles.url} title={url}>{shownUrl}</span>
					<CopyButton text={url} label="Copy URL" />
					<Button onClick={send} disabled={result?.state === 'loading'}>
						<Icon name="play" size={10} /> Send
					</Button>
				</div>
			</header>

			<div class={styles.panes}>
				<div class={styles.pane}>
					<h2 class={styles.paneTitle}>{op.label}</h2>
					{op.auth && (
						<Section title="Authentication" note="Required" right="Bearer">
							<AuthField />
						</Section>
					)}
					{inputs.path.length > 0 && (
						<Section title="Path Parameters">
							<KeyValueTable rows={inputs.path} onChange={set('path')} fixedKeys label="Path parameters" />
						</Section>
					)}
					<Section title="Query Parameters">
						<KeyValueTable rows={inputs.query} onChange={set('query')} label="Query parameters" />
					</Section>
					<Section title="Headers">
						<KeyValueTable rows={inputs.headers} onChange={set('headers')} label="Headers" />
					</Section>
					{inputs.body !== null && (
						<Section title="Request Body" right={op.body.contentType}>
							<textarea class={styles.body} value={inputs.body} spellcheck={false} aria-label="Request body"
								rows={Math.min(20, Math.max(6, inputs.body.split('\n').length + 1))}
								onInput={e => set('body')(e.currentTarget.value)} />
						</Section>
					)}
				</div>

				<div class={styles.pane}>
					<h2 class={styles.paneTitle}>Response</h2>
					<ResponseView result={result} />
					<p class={styles.hint}>Send Request <kbd>{IS_MAC ? '⌘' : 'Ctrl'}</kbd> <kbd>↵</kbd></p>
				</div>
			</div>
		</Dialog>
	);
}
