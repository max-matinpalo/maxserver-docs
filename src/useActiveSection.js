import { useEffect, useRef, useState } from 'preact/hooks';

const OFFSET = 120;


/**
 * Id of the section at the top of the screen; mirrors it in the hash.
 * Also scrolls to the target of a link once it is rendered: a new page
 * or sections that load later, like MCP tools, change `version`.
 * Arrow down and up bring the next or previous section to the top;
 * past the first or last section they call toNeighbor(-1 or 1).
 */
export function useActiveSection(ready, version, target, toNeighbor) {
	const [activeId, setActiveId] = useState(() => target || 'introduction');
	const jumpedTo = useRef(null);
	const neighbor = useRef(toNeighbor);
	neighbor.current = toNeighbor;

	useEffect(() => {
		if (!ready) return;

		// 1. Show a link's target once it exists; without one, the page top
		const el = target && document.getElementById(target);
		if (jumpedTo.current !== target && (el || !target)) {
			el ? el.scrollIntoView({ behavior: 'instant', block: 'start' }) : scrollTo(0, 0);
			jumpedTo.current = target;
		}

		// 2. Track the section at the top while scrolling
		// Read fresh each time: a new page replaces the sections
		const sections = () => [...document.querySelectorAll('[data-anchor]')];
		let frame = 0;
		const update = () => {
			frame = 0;
			jumpedTo.current = target;
			let current = null;
			for (const el of sections()) if (el.getBoundingClientRect().top - OFFSET <= 0 || !current) current = el.id;
			if (!current) return;
			setActiveId(current);
			if (decodeURIComponent(location.hash.slice(1)) !== current) history.replaceState(null, '', `#${current}`);
		};
		const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };

		// 3. Arrow keys, except in fields, dialogs, and with modifiers: down brings the
		// first section below the top edge up, up the last one above it (the start of the
		// section in view, else the one before); the top edge is where scrollIntoView puts it
		const onKey = e => {
			const step = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
			if (!step || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
			if (e.target.closest?.('input, textarea, select, [contenteditable]') || document.querySelector('[role=dialog]')) return;
			e.preventDefault();

			const zoom = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--zoom')) || 1;
			const offset = el => el.getBoundingClientRect().top - (parseFloat(getComputedStyle(el).scrollMarginTop) || 0) * zoom;
			const list = sections();
			const next = step > 0 ? list.find(el => offset(el) > 2) : list.findLast(el => offset(el) < -2);
			if (!next) return neighbor.current?.(step);

			// At the bottom already, the rest cannot reach the top: go on to the next page
			const before = scrollY;
			next.scrollIntoView({ behavior: 'instant', block: 'start' });
			if (step > 0 && scrollY === before) neighbor.current?.(step);
		};

		if (jumpedTo.current === target) update();
		addEventListener('scroll', onScroll, { passive: true });
		addEventListener('keydown', onKey);
		return () => {
			removeEventListener('scroll', onScroll);
			removeEventListener('keydown', onKey);
			cancelAnimationFrame(frame);
		};
	}, [ready, version, target]);

	return activeId;
}
