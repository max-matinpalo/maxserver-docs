import styles from './CodeEditor.module.css';


/**
 * Plain monospace text editor for JSON, growing with its lines.
 */
export function CodeEditor({ value, onChange, label }) {
	return (
		<textarea class={styles.editor} value={value} spellcheck={false} aria-label={label}
			rows={Math.min(20, Math.max(6, value.split('\n').length + 1))}
			onInput={e => onChange(e.currentTarget.value)} />
	);
}
