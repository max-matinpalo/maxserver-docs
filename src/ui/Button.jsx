import styles from './Button.module.css';


/**
 * Small button. variant: dark (Send) or light (Test Request on dark bars).
 */
export function Button({ variant = 'dark', children, ...props }) {
	return <button type="button" class={`${styles.button} ${styles[variant]}`} {...props}>{children}</button>;
}
