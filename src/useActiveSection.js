import { useEffect, useRef, useState } from 'preact/hooks';

const OFFSET = 120;


/**
 * Id of the section at the top of the screen; mirrors it in the hash.
 * Also scrolls to the hash target once it is rendered: sections that
 * load later, like MCP tools, change `version` and are found then.
 * Arrow down and up bring the next or previous section to the top.
 */
export function useActiveSection(ready, version) {
	const [activeId, setActiveId] = useState(() => decodeURIComponent(location.hash.slice(1)) || 'introduction');
	const jumped = useRef(false);

	useEffect(() => {
		if (!ready) return;

		// 1. Jump to a deep link once, when its target exists
		const hash = decodeURIComponent(location.hash.slice(1));
		const target = hash && document.getElementById(hash);
		if (!jumped.current && target) target.scrollIntoView({ behavior: 'instant', block: 'start' });
		if (target || !hash) jumped.current = true;

		// 2. Track the section at the top while scrolling
		const sections = [...document.querySelectorAll('[data-anchor]')];
		const atTop = () => {
			let index = 0;
			sections.forEach((el, i) => { if (el.getBoundingClientRect().top - OFFSET <= 0) index = i; });
			return index;
		};
		let frame = 0;
		const update = () => {
			frame = 0;
			jumped.current = true;
			const current = sections[atTop()]?.id;
			if (!current) return;
			setActiveId(current);
			if (decodeURIComponent(location.hash.slice(1)) !== current) history.replaceState(null, '', `#${current}`);
		};
		const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };

		// 3. Arrow keys, except in fields, dialogs, and with modifiers
		const onKey = e => {
			const step = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
			if (!step || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
			if (e.target.closest?.('input, textarea, select, [contenteditable]') || document.querySelector('[role=dialog]')) return;
			const current = atTop();
			const inside = step < 0 && sections[current]?.getBoundingClientRect().top < -10;
			const target = sections[inside ? current : Math.min(sections.length - 1, Math.max(0, current + step))];
			if (!target) return;
			e.preventDefault();
			target.scrollIntoView({ behavior: 'instant', block: 'start' });
		};

		if (jumped.current) update();
		addEventListener('scroll', onScroll, { passive: true });
		addEventListener('keydown', onKey);
		return () => {
			removeEventListener('scroll', onScroll);
			removeEventListener('keydown', onKey);
			cancelAnimationFrame(frame);
		};
	}, [ready, version]);

	return activeId;
}
