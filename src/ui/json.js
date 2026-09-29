/**
 * Splits formatted JSON into colored tokens for code blocks.
 * Types: key, string, number, literal (true, false, null), punct.
 */

export function tokenizeJson(text) {
	const out = [];
	const re = /("(?:\\.|[^"\\])*")(\s*:)?|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|\b(true|false|null)\b/g;
	let last = 0;
	let m;

	while ((m = re.exec(text))) {
		if (m.index > last) out.push({ type: 'punct', text: text.slice(last, m.index) });
		if (m[1] !== undefined) {
			out.push({ type: m[2] ? 'key' : 'string', text: m[1] });
			if (m[2]) out.push({ type: 'punct', text: m[2] });
		}
		else if (m[3] !== undefined) out.push({ type: 'number', text: m[3] });
		else out.push({ type: 'literal', text: m[4] });
		last = re.lastIndex;
	}

	if (last < text.length) out.push({ type: 'punct', text: text.slice(last) });
	return out;
}
