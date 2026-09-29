import { useEffect, useRef, useState } from 'preact/hooks';

const OFFSET = 120;


/**
 * Id of the section at the top of the screen; mirrors it in the hash.
 * Also scrolls to the target of a link once it is rendered: a new page
 * or sections that load later, like MCP tools, change `version`.
 * Arrow down and up bring the next or previous section to the top;
 * past the first or last section they call toNeighbor(-1 or 1).
 *
 * After its own jumps it remembers the section instead of measuring:
 * Safari's CSS zoom makes measured positions and scroll landings disagree.
 * It measures only after the reader scrolls, and then only above or below.
 */
export function useActiveSection(ready, version, target, toNeighbor) {
	const [activeId, setActiveId] = useState(() => target || 'introduction');
	const jumpedTo = useRef(null);
	const current = useRef(null);
	const jumpedAt = useRef(null);
	const neighbor = useRef(toNeighbor);
	neighbor.current = toNeighbor;

	useEffect(() => {
		if (!ready) return;

		// Read fresh each time: a new page replaces the sections
		const sections = () => [...document.querySelectorAll('[data-anchor]')];
		const select = id => {
			current.current = id;
			setActiveId(id);
			if (decodeURIComponent(location.hash.slice(1)) !== id) history.replaceState(null, '', `#${id}`);
		};

		// Our own jump: the section is known, and so is the scroll position it left
		const jump = el => {
			el.scrollIntoView({ behavior: 'instant', block: 'start' });
			jumpedAt.current = scrollY;
			select(el.id);
		};
		const moved = () => scrollY !== jumpedAt.current;

		// 1. Show a link's target once it exists; without one, the page top
		const el = target && document.getElementById(target);
		if (jumpedTo.current !== target && (el || !target)) {
			if (el) jump(el);
			else {
				scrollTo(0, 0);
				jumpedAt.current = scrollY;
				if (sections()[0]) select(sections()[0].id);
			}
			jumpedTo.current = target;
		}

		// 2. After the reader scrolls: the section at the top, measured
		let frame = 0;
		const update = () => {
			frame = 0;
			if (!moved()) return;
			jumpedTo.current = target;
			let id = null;
			for (const s of sections()) if (!id || s.getBoundingClientRect().top - OFFSET <= 0) id = s.id;
			if (id) select(id);
		};
		const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };

		// 3. Arrow keys, except in fields, dialogs, and with modifiers: the next or
		// previous section from the remembered one; after scrolling, the first below
		// the top edge, or the last above it (the start of the section in view)
		const onKey = e => {
			const step = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
			if (!step || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
			if (e.target.closest?.('input, textarea, select, [contenteditable]') || document.querySelector('[role=dialog]')) return;
			e.preventDefault();

			const list = sections();
			const index = list.findIndex(s => s.id === current.current);
			const next = !moved() && index >= 0 ? list[index + step]
				: step > 0 ? list.find(s => s.getBoundingClientRect().top > 2) : list.findLast(s => s.getBoundingClientRect().top < -2);
			if (next) jump(next);
			else neighbor.current?.(step);
		};

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
