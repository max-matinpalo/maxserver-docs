// Inline icons, no icon library. 16x16 viewBox, stroke = currentColor.

const PATHS = {
	plus: 'M8 3v10M3 8h10',
	minus: 'M3 8h10',
	chevronRight: 'M6 3l5 5-5 5',
	chevronDown: 'M3 6l5 5 5-5',
	lock: 'M4.5 7V5a3.5 3.5 0 0 1 7 0v2M3.5 7h9v6.5h-9z',
	copy: 'M5.5 5.5h7v7h-7zM3.5 10.5v-7h7',
	check: 'M3 8.5l3 3 7-7',
	menu: 'M2.5 4h11M2.5 8h11M2.5 12h11',
	close: 'M4 4l8 8M12 4l-8 8',
	download: 'M8 2.5v8M4.5 7L8 10.5 11.5 7M3 13.5h10',
	play: 'M5 3.5v9l7-4.5z',
	eye: 'M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8zM8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
	eyeOff: 'M2 2l12 12M6.5 4a6.6 6.6 0 0 1 1.5-.5c4 0 6.5 4.5 6.5 4.5a11 11 0 0 1-1.7 2.2M10 12.1a6.3 6.3 0 0 1-2 .4c-4 0-6.5-4.5-6.5-4.5a11 11 0 0 1 2.4-2.8',
};


export function Icon({ name, size = 16, class: className }) {
	return (
		<svg class={className} width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor"
			stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
			<path d={PATHS[name]} />
		</svg>
	);
}
