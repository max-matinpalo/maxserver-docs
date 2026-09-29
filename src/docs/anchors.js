/**
 * Link ids like #tag/projects or #mcp/group/receipts.
 */
export function slug(text) {
	return String(text).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'default';
}
