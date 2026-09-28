/**
 * Where the spec comes from, first match wins:
 * ?spec=, the host page's data-spec, the last used spec,
 * the page's data-default-spec, then ./openapi.json.
 */
export function specUrl(location, root, lastUsed) {
	const raw = new URLSearchParams(location.search).get('spec')
		|| root?.dataset?.spec
		|| lastUsed
		|| root?.dataset?.defaultSpec
		|| './openapi.json';
	return new URL(raw, location.href).href;
}
