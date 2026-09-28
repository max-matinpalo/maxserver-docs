/**
 * Builds an example value from a schema, like Scalar's example panel:
 * examples, example, default, const, enum, then a value for the type.
 */

import { unref, mergeAllOf, typeOf, ownExample } from './schema.js';

const FORMATS = {
	'date-time': '2026-01-01T00:00:00Z',
	date: '2026-01-01',
	time: '00:00:00Z',
	email: 'user@example.com',
	uri: 'https://example.com',
	url: 'https://example.com',
	uuid: '123e4567-e89b-12d3-a456-426614174000',
	ipv4: '127.0.0.1',
	ipv6: '::1',
	hostname: 'example.com',
};

const MAX_DEPTH = 8;


export function exampleFor(doc, raw, depth = 0, seen = new Set()) {

	// 1. Resolve refs, stop on cycles
	const { schema: resolved, model } = unref(doc, raw);
	if (model && seen.has(model)) return {};
	const nextSeen = model ? new Set([...seen, model]) : seen;
	const schema = mergeAllOf(doc, resolved);

	// 2. Given values
	const given = ownExample(schema);
	if (given !== undefined) return given;
	if (schema.default !== undefined) return schema.default;
	if (schema.const !== undefined) return schema.const;
	if (Array.isArray(schema.enum) && schema.enum.length) return schema.enum[0];

	// 3. Variants: first one
	const variants = schema.oneOf || schema.anyOf;
	if (Array.isArray(variants) && variants.length) return exampleFor(doc, variants[0], depth, nextSeen);

	if (depth > MAX_DEPTH) return null;

	// 4. By type
	const { type } = typeOf(schema);
	if (type === 'object' || schema.properties) {
		const out = {};
		for (const [key, prop] of Object.entries(schema.properties || {}))
			out[key] = exampleFor(doc, prop, depth + 1, nextSeen);
		return out;
	}
	if (type === 'array') return schema.items ? [exampleFor(doc, schema.items, depth + 1, nextSeen)] : [];
	if (type === 'string') return FORMATS[schema.format] ?? '';
	if (type === 'integer' || type === 'number') return schema.minimum ?? 1;
	if (type === 'boolean') return true;
	return null;
}
