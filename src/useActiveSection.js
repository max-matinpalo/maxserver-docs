import { useEffect, useRef, useState } from 'preact/hooks';

const OFFSET = 120;


/**
 * Id of the section at the top of the screen; mirrors it in the hash.
 * Also scrolls to the hash target once it is rendered: sections that
 * load later, like MCP tools, change `version` and are found then.
 */
export function useActiveSection(ready, version) {
	const [activeId, setActiveId] = useState(() => decodeURIComponent(location.hash.slice(1)) || 'introduction');
	const jumped = useRef(false);

	useEffect(() => {
		if (!ready) return;

		// 1. Jump to a deep link once, when its target exists
		const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
		if (!jumped.current && target) {
			target.scrollIntoView({ behavior: 'instant', block: 'start' });
			jumped.current = true;
		}

		// 2. Track the section at the top while scrolling
		const sections = [...document.querySelectorAll('[data-anchor]')];
		let frame = 0;
		const update = () => {
			frame = 0;
			jumped.current = true;
			let current = sections[0]?.id;
			for (const el of sections) {
				if (el.getBoundingClientRect().top - OFFSET <= 0) current = el.id;
				else break;
			}
			if (!current) return;
			setActiveId(current);
			if (decodeURIComponent(location.hash.slice(1)) !== current) history.replaceState(null, '', `#${current}`);
		};
		const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };

		addEventListener('scroll', onScroll, { passive: true });
		return () => {
			removeEventListener('scroll', onScroll);
			cancelAnimationFrame(frame);
		};
	}, [ready, version]);

	return activeId;
}
