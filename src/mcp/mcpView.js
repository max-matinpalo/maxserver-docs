/**
 * What an MCP Apps host does with a view's HTML and the files a tool
 * sends. No DOM here, so it can be tested with node --test.
 */

const DOMAIN = /^[\w.:/*-]+$/;


/**
 * The CSP a host gives a view: inline code and data URLs, plus only the
 * domains its resource declares in _meta.ui.csp.
 */
export function viewCsp(csp = {}) {
	const list = key => (csp[key] || []).filter(d => DOMAIN.test(d)).join(' ');
	const resources = list('resourceDomains');
	return [
		"default-src 'none'",
		`script-src 'unsafe-inline' ${resources}`,
		`style-src 'unsafe-inline' ${resources}`,
		`img-src data: blob: ${resources}`,
		`font-src data: ${resources}`,
		`media-src data: blob: ${resources}`,
		`connect-src ${list('connectDomains') || "'none'"}`,
	].map(rule => rule.trim()).join('; ');
}


/**
 * The view's HTML with its CSP first in the head.
 */
export function viewDocument(html, csp) {
	const meta = `<meta http-equiv="Content-Security-Policy" content="${viewCsp(csp)}">`;
	return /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, tag => tag + meta) : meta + html;
}


/**
 * The bytes of a resource's base64 blob, or of its text.
 */
export function resourceBytes(resource) {
	if (typeof resource.blob === 'string') return Uint8Array.from(atob(resource.blob), c => c.charCodeAt(0));
	return new TextEncoder().encode(resource.text || '');
}


export function resourceText(resource) {
	return typeof resource.text === 'string' ? resource.text : new TextDecoder().decode(resourceBytes(resource));
}


/**
 * A file name from the resource URI's last segment.
 */
export function fileName(uri) {
	const last = String(uri || '').split(/[/:]/).filter(Boolean).pop();
	try {
		return last ? decodeURIComponent(last) : 'download';
	} catch {
		return last;
	}
}
