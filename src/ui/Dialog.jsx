import { useEffect, useRef } from 'preact/hooks';
import { Icon } from './Icon.jsx';
import styles from './Dialog.module.css';


/**
 * Large modal window over the page. Escape and the close button close it;
 * the page behind does not scroll while it is open.
 */
export function Dialog({ label, onClose, onKeyDown, children }) {
	const ref = useRef(null);

	useEffect(() => {
		// 1. Focus inside, lock page scroll, restore both on close
		const before = document.activeElement;
		const overflow = document.documentElement.style.overflow;
		document.documentElement.style.overflow = 'hidden';
		ref.current?.focus({ preventScroll: true });

		return () => {
			document.documentElement.style.overflow = overflow;
			before?.focus?.({ preventScroll: true });
		};
	}, []);

	const keyDown = e => {
		if (e.key === 'Escape') {
			e.stopPropagation();
			onClose();
			return;
		}
		onKeyDown?.(e);
	};

	return (
		<div class={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
			<button type="button" class={styles.close} aria-label="Close" onClick={onClose}>
				<Icon name="close" size={16} />
			</button>
			<div ref={ref} class={styles.dialog} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} onKeyDown={keyDown}>
				{children}
			</div>
		</div>
	);
}
