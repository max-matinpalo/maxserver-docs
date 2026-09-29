import { useEffect, useState } from 'preact/hooks';
import { connect } from './mcp.js';


/**
 * The MCP server at url: handshake, tools, and resources, kept until
 * the page reloads or reload() is called. The token is read at connect
 * time, so typing a token does not reconnect on every key.
 */
export function useMcp(url, token) {
	const [state, setState] = useState({ status: url ? 'loading' : 'off' });
	const [attempt, setAttempt] = useState(0);

	useEffect(() => {
		if (!url) {
			setState({ status: 'off' });
			return;
		}
		let current = true;
		setState({ status: 'loading' });
		connect(url, token)
			.then(server => current && setState({ status: 'ready', server }))
			.catch(err => current && setState({ status: 'error', message: err.message, unauthorized: !!err.unauthorized }));
		return () => { current = false; };
	}, [url, attempt]);

	return [state, () => setAttempt(attempt + 1)];
}
