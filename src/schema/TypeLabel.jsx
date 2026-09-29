import { typeOf } from './schema.js';
import styles from './TypeLabel.module.css';


/**
 * Type of a described schema: string, User (model link), array User[].
 */
export function TypeLabel({ info }) {
	const { model, type, items, variants } = info;
	const link = name => <a class={styles.model} href={`#model/${name}`}>{name}</a>;

	if (type === 'array') {
		const itemType = items?.model ? link(items.model) : typeOf(items?.schema || {}).type || 'any';
		return <span class={styles.type}>array {itemType}[]</span>;
	}
	if (model) return link(model);
	return <span class={styles.type}>{type || (variants ? 'one of' : 'any')}</span>;
}
