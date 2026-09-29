import { fileName, resourceBytes } from './mcpView.js';


/**
 * Saves an embedded resource, like a PDF a tool sends, as a file.
 */
export function saveResource(resource) {
	const blob = new Blob([resourceBytes(resource)], { type: resource.mimeType || 'application/octet-stream' });
	const url = URL.createObjectURL(blob);
	Object.assign(document.createElement('a'), { href: url, download: fileName(resource.uri) }).click();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}
