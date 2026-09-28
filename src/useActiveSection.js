import { useEffect, useState } from 'preact/hooks';

const OFFSET = 120;


/**
 * Id of the section at the top of the screen; mirrors it in the hash.
 * Also scrolls to the hash target once the content is rendered.
 */
export function useActiveSection(ready) {
	const [activeId, setActiveId] = useState(() => decodeURIComponent(location.hash.slice(1)) || 'introduction');

	useEffect(() => {
		if (!ready) return;

		// 1. Jump to a deep link after the first render
		const initial = decodeURIComponent(location.hash.slice(1));
		if (initial) document.getElementById(initial)?.scrollIntoView({ behavior: 'instant', block: 'start' });

		// 2. Track the section at the top while scrolling
		const sections = [...document.querySelectorAll('[data-anchor]')];
		let frame = 0;
		const update = () => {
			frame = 0;
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
	}, [ready]);

	return activeId;
}
