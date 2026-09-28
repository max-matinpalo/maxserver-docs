import { useState } from 'preact/hooks';
import { formatSize, prettyJson } from './request.js';
import { Section } from './ui/Section.jsx';
import { CodeBlock } from './ui/CodeBlock.jsx';
import styles from './ResponseView.module.css';


/**
 * Header pairs as a two-column list.
 */
function headerList(headers) {
	return (
		<dl class={styles.headers}>
			{headers.map(([k, v], i) => (
				<div key={i} class={styles.headerRow}><dt>{k}</dt><dd>{v}</dd></div>
			))}
		</dl>
	);
}


/**
 * Result of a test request: status, time, size, headers, and body.
 */
export function ResponseView({ result }) {
	const [raw, setRaw] = useState(false);

	// 1. Nothing sent yet, sending, or failed
	if (!result) return <p class={styles.empty}>Send the request to see the response.</p>;
	if (result.state === 'loading') return <p class={styles.empty}>Sending…</p>;
	if (result.state === 'error') {
		return (
			<div class={styles.error} role="alert">
				<strong>The request failed.</strong>
				<p>{result.message}</p>
				<p>The server may be down, or it does not allow this page's origin (CORS).</p>
			</div>
		);
	}

	// 2. Response
	const pretty = prettyJson(result.text);
	const body = raw || pretty === null ? result.text : pretty;

	return (
		<div>
			<div class={styles.summary} aria-live="polite">
				<span>{Math.round(result.time)}ms</span>
				<span>{formatSize(result.size)}</span>
				<span class={styles.status}>{result.code} {result.statusText}</span>
				<span class={`${styles.dot} ${result.code < 400 ? styles.ok : styles.bad}`} aria-hidden="true" />
			</div>
			<Section title="Request Headers" note={result.requestHeaders.length} defaultOpen={false}>
				{headerList(result.requestHeaders)}
			</Section>
			<Section title="Response Headers" note={result.responseHeaders.length} defaultOpen={false}>
				{headerList(result.responseHeaders)}
			</Section>
			<Section title="Body" right={result.contentType}>
				{pretty !== null && (
					<div class={styles.views}>
						<button type="button" class={`${styles.view} ${!raw ? styles.viewActive : ''}`} onClick={() => setRaw(false)}>Preview</button>
						<button type="button" class={`${styles.view} ${raw ? styles.viewActive : ''}`} onClick={() => setRaw(true)}>Raw</button>
					</div>
				)}
				<div class={styles.body}>
					{!result.text ? <p class={styles.noBody}>No body</p>
						: pretty !== null && !raw ? <CodeBlock value={body} /> : <pre class={styles.raw}>{body}</pre>}
				</div>
			</Section>
		</div>
	);
}
