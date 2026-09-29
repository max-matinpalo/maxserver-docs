import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clampWidth, clampZoom, effectiveTheme, readAppearance, themeSetting } from '../src/settings/appearance.js';


test('zoom and width: whole numbers within their range, else the default', () => {
	assert.equal(clampZoom('137.4'), 137);
	assert.equal(clampZoom(20), 50);
	assert.equal(clampZoom(900), 200);
	assert.equal(clampZoom('abc'), 100);
	assert.equal(clampZoom(null), 100);
	assert.equal(clampWidth(''), 288);
	assert.equal(clampWidth(100), 200);
	assert.equal(clampWidth(351), 351);
});

test('theme: light, dark, or auto following the system', () => {
	assert.equal(themeSetting('dark'), 'dark');
	assert.equal(themeSetting('purple'), 'auto');
	assert.equal(effectiveTheme('auto', true), 'dark');
	assert.equal(effectiveTheme('auto', false), 'light');
	assert.equal(effectiveTheme('light', true), 'light');
});

test('stored values, also with broken or blocked storage', () => {
	const stored = { 'maxserver-docs:theme': 'dark', 'maxserver-docs:zoom': '125', 'maxserver-docs:sidebar': '320' };
	assert.deepEqual(readAppearance({ getItem: key => stored[key] ?? null }), { theme: 'dark', zoom: 125, width: 320 });
	assert.deepEqual(readAppearance({ getItem: () => { throw new Error('blocked'); } }), { theme: 'auto', zoom: 100, width: 288 });
});
