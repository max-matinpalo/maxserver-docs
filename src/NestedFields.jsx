import { SchemaField } from './SchemaField.jsx';


/**
 * Fields of an object, or the variants of oneOf / anyOf.
 */
export function NestedFields({ info }) {
	if (info.variants) {
		return info.variants.map((v, i) => (
			<SchemaField key={i} name={`option ${i + 1}`} schema={v} seen={info.nextSeen} />
		));
	}
	const required = info.inner.required || [];
	return Object.entries(info.inner.properties || {}).map(([key, prop]) => (
		<SchemaField key={key} name={key} schema={prop} required={required.includes(key)} seen={info.nextSeen} />
	));
}
