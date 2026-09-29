import { render } from 'preact';
import { App } from './App.jsx';
import { specUrl } from './rest/specUrl.js';
import { readRecent } from './rest/recentSpecs.js';
import { applyAppearance, effectiveTheme, readAppearance, systemDark } from './settings/appearance.js';
import './global.css';

// Theme, zoom, and sidebar width before the first paint
const saved = readAppearance();
applyAppearance({ ...saved, theme: effectiveTheme(saved.theme, systemDark()) });

const root = document.getElementById('app') || document.body.appendChild(document.createElement('div'));
// A host page with a fixed data-spec (e.g. maxserver /docs) gets no spec field
render(<App url={specUrl(window.location, root, readRecent()[0])} specField={!root.dataset.spec} />, root);
