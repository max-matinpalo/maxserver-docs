# maxserver-docs

- Read `maxserver-docs.m` before changing anything; keep it in sync with agreed behavior.
- Apply the `frontend` skill: JavaScript, Preact, CSS Modules, px units, no CSS nesting.
- Runtime dependency: preact only. Dev: vite and @preact/preset-vite only. Add nothing else.
- Reusable UI components live in `src/ui/`; API-docs components in `src/`.
- Dev server: `npm run dev` at http://localhost:3002.
- Live requests: run any maxserver app (npx maxserver new, npm run dev) and open its spec with the spec field.
- Ship to maxserver: npm run build, then copy dist/maxserver-docs.js and .css into maxserver's devdocs/.
  Ask the user where the maxserver repo is.
- Tests: `npm test` (node --test, logic only). Check the UI in the browser, narrow and wide.
