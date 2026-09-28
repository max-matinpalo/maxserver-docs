import styles from './Pill.module.css';


/**
 * Small rounded label. tone: plain or required.
 */
export function Pill({ children, tone = 'plain' }) {
	return <span class={`${styles.pill} ${styles[tone]}`}>{children}</span>;
}
