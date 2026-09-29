import { useContext, useState } from 'preact/hooks';
import { DocContext } from '../contexts.js';
import { ClientContext } from '../contexts.js';
import { initialInputs, buildRequest, buildUrl } from './request.js';
import { statusText } from '../docs/http.js';
import { TestPanel } from '../ui/TestPanel.jsx';
import { Section } from '../ui/Section.jsx';
import { KeyValueTable } from '../ui/KeyValueTable.jsx';
import { CodeEditor } from '../ui/CodeEditor.jsx';
import { AuthField } from '../docs/AuthField.jsx';
import { ResponseView } from '../docs/ResponseView.jsx';


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

	return (
		<TestPanel label={`Test request: ${op.label}`} method={op.method} target={shownUrl} copyText={url}
			onSend={send} sending={result?.state === 'loading'} onClose={onClose}
			title={op.label} resultTitle="Response" result={<ResponseView result={result} />}>
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
					<CodeEditor value={inputs.body} onChange={set('body')} label="Request body" />
				</Section>
			)}
		</TestPanel>
	);
}
