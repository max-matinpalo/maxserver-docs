# maxserver-docs

- Read `maxserver-docs.m` before changing anything; keep it in sync with agreed behavior.
- Apply the `frontend` skill: JavaScript, Preact, CSS Modules, px units, no CSS nesting.
- Runtime dependency: preact only. Dev: vite and @preact/preset-vite only. Add nothing else.
- Reusable UI components live in `src/ui/`; API-docs components in `src/`.
- Dev server: `npm run dev` at http://localhost:3002.
- Reference: Scalar at http://localhost:3000/docs (`~/Desktop/exampleProject`, `npm run dev`).
  Compare our UI with it side by side after visible changes.
- Tests: `npm test` (node --test, logic only). Check the UI in the browser, narrow and wide.
