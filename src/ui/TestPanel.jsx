import { Dialog } from './Dialog.jsx';
import { MethodBadge } from './MethodBadge.jsx';
import { CopyButton } from './CopyButton.jsx';
import { Button } from './Button.jsx';
import { Icon } from './Icon.jsx';
import styles from './TestPanel.module.css';

const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);


/**
 * Test window: a method and target bar with Send, inputs left, result
 * right. Cmd or Ctrl+Enter sends.
 */
export function TestPanel({ label, method, target, copyText, onSend, sending, onClose, title, resultTitle, result, children }) {
	const keyDown = e => {
		if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			onSend();
		}
	};

	return (
		<Dialog label={label} onClose={onClose} onKeyDown={keyDown}>
			<header class={styles.top}>
				<div class={styles.urlBar}>
					<span class={styles.method}><MethodBadge method={method} /></span>
					<span class={styles.url} title={copyText}>{target}</span>
					<CopyButton text={copyText} label="Copy" />
					<Button onClick={onSend} disabled={sending}>
						<Icon name="play" size={10} /> Send
					</Button>
				</div>
			</header>

			<div class={styles.panes}>
				<div class={styles.pane}>
					<h2 class={styles.paneTitle}>{title}</h2>
					{children}
				</div>

				<div class={styles.pane}>
					<h2 class={styles.paneTitle}>{resultTitle}</h2>
					{result}
					<p class={styles.hint}>Send <kbd>{IS_MAC ? '⌘' : 'Ctrl'}</kbd> <kbd>↵</kbd></p>
				</div>
			</div>
		</Dialog>
	);
}
