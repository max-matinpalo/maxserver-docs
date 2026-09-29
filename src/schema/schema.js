/**
 * Schema helpers shared by field rows and examples.
 */

const MODEL_REF = /^#\/components\/schemas\/([^/]+)$/;


/**
 * Follows a local JSON pointer like "#/components/schemas/User".
 */
export function resolvePointer(doc, ref) {
	if (typeof ref !== 'string' || !ref.startsWith('#/')) return undefined;
	let value = doc;
	for (const raw of ref.slice(2).split('/')) {
		const key = decodeURIComponent(raw).replace(/~1/g, '/').replace(/~0/g, '~');
		if (value == null || typeof value !== 'object') return undefined;
		value = value[key];
	}
	return value;
}


/**
 * Model name of a $ref to a whole schema, else null.
 */
export function modelName(ref) {
	const m = typeof ref === 'string' && ref.match(MODEL_REF);
	return m ? decodeURIComponent(m[1]) : null;
}


/**
 * Resolves a $ref and remembers the model name when it points to one.
 * Sibling keys (like description) win over the target.
 */
export function unref(doc, schema) {
	if (!schema || typeof schema !== 'object' || !schema.$ref) return { schema: schema || {}, model: null };
	const { $ref, ...rest } = schema;
	const target = resolvePointer(doc, $ref) || {};
	return { schema: { ...target, ...rest }, model: modelName($ref) };
}


/**
 * allOf merges properties and required into one object schema.
 */
export function mergeAllOf(doc, schema) {
	if (!Array.isArray(schema?.allOf)) return schema;
	const { allOf, ...rest } = schema;
	const out = { ...rest, properties: { ...rest.properties }, required: [...(rest.required || [])] };

	for (const part of allOf) {
		const s = mergeAllOf(doc, unref(doc, part).schema);
		Object.assign(out.properties, s.properties);
		out.required.push(...(s.required || []));
		if (!out.type && s.type) out.type = s.type;
		if (!out.description && s.description) out.description = s.description;
	}

	if (!Object.keys(out.properties).length) delete out.properties;
	if (!out.required.length) delete out.required;
	return out;
}


/**
 * Main type and whether null is allowed: type: ["string", "null"].
 */
export function typeOf(schema) {
	const types = Array.isArray(schema.type) ? schema.type : schema.type ? [schema.type] : [];
	const main = types.filter(t => t !== 'null');
	let type = main.join(' | ');
	if (!type && schema.properties) type = 'object';
	if (!type && schema.items) type = 'array';
	if (!type && schema.enum) type = typeof schema.enum[0];
	return { type, nullable: types.includes('null') || schema.nullable === true };
}


/**
 * Short constraint texts, like "min length: 1" or "enum: todo, doing".
 */
export function constraints(schema) {
	const out = [];
	const add = (key, label) => schema[key] !== undefined && out.push(`${label}: ${schema[key]}`);
	add('minLength', 'min length');
	add('maxLength', 'max length');
	add('minimum', 'min');
	add('maximum', 'max');
	add('exclusiveMinimum', 'greater than');
	add('exclusiveMaximum', 'less than');
	add('minItems', 'min items');
	add('maxItems', 'max items');
	add('minProperties', 'min properties');
	add('maxProperties', 'max properties');
	add('pattern', 'pattern');
	if (schema.default !== undefined) out.push(`default: ${JSON.stringify(schema.default)}`);
	return out;
}


/**
 * First example value of a schema, or undefined.
 */
export function ownExample(schema) {
	if (Array.isArray(schema.examples) && schema.examples.length) return schema.examples[0];
	if (schema.example !== undefined) return schema.example;
	return undefined;
}


/**
 * What a schema is and what can be opened below it:
 * object properties, array item properties, or oneOf / anyOf variants.
 * seen: model names on the way here, so recursive models stop.
 */
export function describe(doc, raw, seen = new Set()) {

	// 1. Resolve refs and allOf
	const { schema: resolved, model } = unref(doc, raw);
	const schema = mergeAllOf(doc, resolved);
	const { type, nullable } = typeOf(schema);
	const cycle = !!model && seen.has(model);

	// 2. Arrays: described by their items
	let items = null;
	if (type === 'array' && schema.items) {
		const r = unref(doc, schema.items);
		items = { model: r.model, schema: mergeAllOf(doc, r.schema) };
	}

	// 3. What opens
	const inner = items?.schema.properties ? items.schema : schema.properties ? schema : null;
	const variants = schema.oneOf || schema.anyOf || null;
	const innerModel = items?.model || model;
	const nextSeen = innerModel ? new Set([...seen, innerModel]) : seen;

	return { schema, model, type, nullable, items, inner: cycle ? null : inner, variants: cycle ? null : variants, nextSeen };
}


/**
 * Texts after the type: format, nullable, constraints, enum.
 */
export function metaParts(info) {
	const { schema, nullable } = info;
	const parts = [];
	if (schema.format) parts.push(schema.format);
	if (nullable) parts.push('nullable');
	parts.push(...constraints(schema));
	if (Array.isArray(schema.enum)) parts.push(`enum: ${schema.enum.map(v => JSON.stringify(v)).join(', ')}`);
	return parts;
}


/**
 * Short field list of a closed object: "{ id, email, name }".
 */
export function previewText(inner) {
	const keys = Object.keys(inner?.properties || {});
	if (!keys.length) return '';
	return `{ ${keys.slice(0, 4).join(', ')}${keys.length > 4 ? ', …' : ''} }`;
}
