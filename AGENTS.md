# maxserver-docs

- Read `maxserver-docs.m` before changing anything; keep it in sync with agreed behavior.
- Apply the `frontend` skill: JavaScript, Preact, CSS Modules, px units, no CSS nesting.
- Runtime dependency: preact only. Dev: vite and @preact/preset-vite only. Add nothing else.
- Folders by feature: `src/ui/` (reusable, no API knowledge), `schema/`, `docs/` (shared by both sides), `rest/`, `mcp/`, `sidebar/`, `settings/`; only the app shell at the `src/` top level. See SOURCE in `maxserver-docs.m`.
- Dev server: `npm run dev` at http://localhost:3002.
- Live requests: run any maxserver app (npx maxserver new, npm run dev) and open its spec with the spec field.
- Live MCP: set the MCP field to the app's endpoint, like /mcp, and paste a token.
- Ship to maxserver: npm run build, then copy dist/maxserver-docs.js and .css into maxserver's devdocs/.
  Ask the user where the maxserver repo is.
- Tests: `npm test` (node --test, logic only). Check the UI in the browser, narrow and wide.
