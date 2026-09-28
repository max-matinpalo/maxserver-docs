import { render } from 'preact';
import { App } from './App.jsx';
import { specUrl } from './specUrl.js';
import { readRecent } from './recentSpecs.js';
import './global.css';

const root = document.getElementById('app') || document.body.appendChild(document.createElement('div'));
// A host page with a fixed data-spec (e.g. maxserver /docs) gets no spec field
render(<App url={specUrl(window.location, root, readRecent()[0])} specField={!root.dataset.spec} />, root);
