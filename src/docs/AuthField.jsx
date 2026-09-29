import { useContext, useState } from 'preact/hooks';
import { ClientContext } from '../contexts.js';
import { Icon } from '../ui/Icon.jsx';
import styles from './AuthField.module.css';


/**
 * The one Bearer token field; every copy edits the same token.
 */
export function AuthField() {
	const { token, setToken } = useContext(ClientContext);
	const [visible, setVisible] = useState(false);

	return (
		<label class={styles.field}>
			<span class={styles.label}>Bearer Token:</span>
			<input class={styles.input} type={visible ? 'text' : 'password'} value={token} placeholder="Token"
				autocomplete="off" spellcheck={false} onInput={e => setToken(e.currentTarget.value.trim())} />
			<button type="button" class={styles.eye} aria-label={visible ? 'Hide token' : 'Show token'}
				onClick={() => setVisible(!visible)}>
				<Icon name={visible ? 'eyeOff' : 'eye'} size={15} />
			</button>
		</label>
	);
}
