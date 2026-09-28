/**
 * Reads an OpenAPI 3.1 document into the model the UI renders:
 * sidebar groups, operations, and models.
 */

const METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];
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
 * Resolves $ref chains (parameters, bodies, responses); sibling keys win.
 */
export function deref(doc, value, seen = new Set()) {
	if (!value || typeof value !== 'object' || !value.$ref || seen.has(value.$ref)) return value;
	seen.add(value.$ref);
	const { $ref, ...rest } = value;
	const target = deref(doc, resolvePointer(doc, $ref), seen);
	return target && typeof target === 'object' ? { ...target, ...rest } : rest;
}


export function slug(text) {
	return String(text).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'default';
}


function pickContent(content) {
	if (!content || typeof content !== 'object') return null;
	const type = content['application/json'] ? 'application/json' : Object.keys(content)[0];
	return type ? { contentType: type, schema: content[type]?.schema ?? null } : null;
}


/**
 * Path-level and operation parameters, operation wins per name + in.
 */
function readParams(doc, pathItem, op) {
	const byKey = new Map();
	for (const raw of [...(pathItem.parameters || []), ...(op.parameters || [])]) {
		const p = deref(doc, raw);
		if (!p?.name || !p.in) continue;
		byKey.set(`${p.in}:${p.name}`, {
			name: p.name,
			in: p.in,
			required: p.in === 'path' || !!p.required,
			description: p.description || '',
			schema: p.schema || {},
		});
	}

	const params = { path: [], query: [], header: [], cookie: [] };
	for (const p of byKey.values()) params[p.in]?.push(p);
	return params;
}


function readBody(doc, op) {
	const body = deref(doc, op.requestBody);
	const content = body && pickContent(body.content);
	if (!content) return null;
	return { ...content, required: !!body.required, description: body.description || '' };
}


function readResponses(doc, op) {
	return Object.entries(op.responses || {}).map(([status, raw]) => {
		const r = deref(doc, raw) || {};
		const content = pickContent(r.content);
		return {
			status,
			description: r.description || '',
			contentType: content?.contentType ?? null,
			schema: content?.schema ?? null,
		};
	});
}


function needsAuth(doc, op) {
	const security = op.security ?? doc.security ?? [];
	return security.some(req => req && Object.keys(req).length > 0);
}


/**
 * The whole model. Throws a readable error for documents it cannot use.
 */
export function readSpec(doc) {

	// 1. Validate
	if (!doc || typeof doc !== 'object' || Array.isArray(doc)) throw new Error('The document is not a JSON object.');
	if (!doc.openapi && !doc.swagger) throw new Error('The document has no "openapi" version field.');
	if (doc.paths && typeof doc.paths !== 'object') throw new Error('"paths" must be an object.');

	// 2. Operations in paths order
	const operations = [];
	for (const [path, pathItem] of Object.entries(doc.paths || {})) {
		if (!pathItem || typeof pathItem !== 'object') continue;
		for (const method of Object.keys(pathItem).filter(k => METHODS.includes(k))) {
			const op = pathItem[method];
			if (!op || typeof op !== 'object') continue;
			operations.push({
				method: method.toUpperCase(),
				path,
				tag: Array.isArray(op.tags) && op.tags[0] ? String(op.tags[0]) : null,
				summary: op.summary || '',
				description: op.description || '',
				auth: needsAuth(doc, op),
				params: readParams(doc, pathItem, op),
				body: readBody(doc, op),
				responses: readResponses(doc, op),
			});
		}
	}

	// 3. Groups: top-level tags order first, then first appearance
	const tagInfo = new Map((doc.tags || []).filter(t => t?.name).map(t => [t.name, t]));
	const order = [...tagInfo.keys()];
	for (const op of operations) if (op.tag && !order.includes(op.tag)) order.push(op.tag);

	const groups = order
		.map(name => ({
			name,
			id: `tag/${slug(name)}`,
			description: tagInfo.get(name)?.description || '',
			operations: operations.filter(op => op.tag === name),
		}))
		.filter(g => g.operations.length);

	// 4. Anchors, like Scalar: #tag/projects/POST/projects
	for (const op of operations) {
		op.id = op.tag ? `tag/${slug(op.tag)}/${op.method}${op.path}` : `operation/${op.method}${op.path}`;
		op.label = op.summary || `${op.method} ${op.path}`;
	}

	// 5. Models
	const models = Object.entries(doc.components?.schemas || {}).map(([name, schema]) => ({
		name,
		id: `model/${name}`,
		schema,
	}));

	return {
		info: {
			title: doc.info?.title || 'API',
			version: doc.info?.version || '',
			description: doc.info?.description || '',
		},
		openapi: String(doc.openapi || doc.swagger),
		untagged: operations.filter(op => !op.tag),
		groups,
		models,
		operations,
	};
}
