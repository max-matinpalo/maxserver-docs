/**
 * Small safe Markdown for OpenAPI descriptions.
 * Returns a tree of plain objects; Markdown.jsx renders it without innerHTML.
 * Blocks: paragraphs, lists, headings, fenced code.
 * Inline: `code`, **strong**, *em*, [links](url), bare URLs and emails.
 */

const SAFE_URL = /^(https?:|mailto:|#|\/|\.{0,2}\/|[^:]*$)/i;


export function safeUrl(url) {
	const u = String(url).trim();
	return SAFE_URL.test(u) ? u : null;
}


/**
 * Inline tokens of one text line.
 */
export function parseInline(text) {
	const out = [];
	const re = /`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)\s]+)\)|(https?:\/\/[^\s<)]+)|([\w.+-]+@[\w-]+\.[\w.-]*\w)/g;
	let last = 0;
	let m;

	while ((m = re.exec(text))) {
		if (m.index > last) out.push({ type: 'text', text: text.slice(last, m.index) });
		if (m[1] !== undefined) out.push({ type: 'code', text: m[1] });
		else if (m[2] !== undefined) out.push({ type: 'strong', children: parseInline(m[2]) });
		else if (m[3] !== undefined) out.push({ type: 'em', children: parseInline(m[3]) });
		else if (m[4] !== undefined) {
			const href = safeUrl(m[5]);
			out.push(href ? { type: 'link', href, children: parseInline(m[4]) } : { type: 'text', text: m[4] });
		}
		else if (m[6] !== undefined) out.push({ type: 'link', href: m[6], children: [{ type: 'text', text: m[6] }] });
		else out.push({ type: 'link', href: `mailto:${m[7]}`, children: [{ type: 'text', text: m[7] }] });
		last = re.lastIndex;
	}

	if (last < text.length) out.push({ type: 'text', text: text.slice(last) });
	return out;
}


/**
 * Block tree of a Markdown string.
 */
export function parseMarkdown(source) {
	const lines = String(source || '').replace(/\r\n?/g, '\n').split('\n');
	const blocks = [];
	let i = 0;

	while (i < lines.length) {
		const line = lines[i];

		// 1. Blank lines separate blocks
		if (!line.trim()) { i++; continue; }

		// 2. Fenced code
		if (/^```/.test(line.trim())) {
			const code = [];
			i++;
			while (i < lines.length && !/^```/.test(lines[i].trim())) code.push(lines[i++]);
			i++;
			blocks.push({ type: 'codeblock', text: code.join('\n') });
			continue;
		}

		// 3. Headings
		const heading = line.match(/^(#{1,6})\s+(.*)$/);
		if (heading) {
			blocks.push({ type: 'heading', level: heading[1].length, children: parseInline(heading[2]) });
			i++;
			continue;
		}

		// 4. Lists
		const bullet = /^\s*([-*+]|\d+[.)])\s+/;
		if (bullet.test(line)) {
			const ordered = /^\s*\d/.test(line);
			const items = [];
			while (i < lines.length && bullet.test(lines[i])) items.push(parseInline(lines[i++].replace(bullet, '')));
			blocks.push({ type: 'list', ordered, items });
			continue;
		}

		// 5. Paragraph until a blank line or another block
		const text = [];
		while (i < lines.length && lines[i].trim() && !bullet.test(lines[i]) && !/^(#{1,6}\s|```)/.test(lines[i].trim())) text.push(lines[i++].trim());
		blocks.push({ type: 'paragraph', children: parseInline(text.join(' ')) });
	}

	return blocks;
}
