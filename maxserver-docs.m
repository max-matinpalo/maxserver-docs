OVERVIEW
- maxserver-docs renders an OpenAPI 3.1 document as a browsable API
  reference.
- It is a dev tool: maxserver ships its build and serves it at /docs in
  development; standalone it opens any server's spec.

DEPENDENCIES
- The only runtime dependency is Preact.
- Development uses only vite and @preact/preset-vite.
- No other dependencies.
- Description Markdown, JSON highlighting, and examples use own code.

SPEC SOURCE
- The page loads one openapi.json and renders it in the browser.
- Order: ?spec=, the host page's data-spec, the last used spec, the
  page's data-default-spec, then ./openapi.json.
- Standalone (no data-spec), a field at the top of the sidebar opens another
  spec URL; the last five are remembered.
- The bundle is never changed per project.
- Loading, fetch errors, and invalid documents show a clear message.

DESIGN
- Matches Scalar's colors, sizes, spacing, and 0.5px hairlines, measured
  from the running reference.
- Uses the system fonts where Scalar uses Inter and JetBrains Mono.
- Scalar at http://localhost:3000/docs (~/Desktop/exampleProject) is the
  layout and behavior reference.
- Screenshots: ~/Desktop/maxdoc/planning/assets/.
- Uses px units, flat CSS Modules, and the frontend skill's targets.

SOURCE
- src/ui/ holds reusable UI components, like badges, foldable rows,
  tabs, code blocks, and copy buttons.
- Other src/ components are specific to API docs and build on src/ui/.
- One component per .jsx file, with its CSS Module next to it.

BUILD
- npm run dev serves the example at http://localhost:3002 with hot
  reload.
- npm run build writes minified dist/maxserver-docs.js and .css for
  embedding.
- examples/openapi.json is the exampleProject spec that Scalar shows.

TESTS
- node --test covers spec reading, examples, and Markdown.
- The UI is checked in the browser next to Scalar, narrow and wide.

VERSION 1
- A read-only reference: sidebar and every route, without sending
  requests.
- Light mode only.

	LAYOUT
	- A left sidebar and one scrolling content column.
	- Narrow screens hide the sidebar behind a menu button.

	SIDEBAR
	- Introduction comes from info.
	- Groups come from each operation's first tag; untagged operations
	  list first without a group.
	- Group order follows top-level tags, else first appearance in
	  paths.
	- Entries show the summary and a colored method badge, in paths
	  order.
	- Groups fold; the group of the operation in view opens.
	- Models list the components.schemas keys.
	- The entry of the operation in view is highlighted.

	DEEP LINKS
	- Operations, tags, and models have hash links, like
	  #tag/projects/POST/projects.
	- Opening a link scrolls to its target; scrolling updates the hash.

	INTRODUCTION
	- Shows title, version, description, and a spec download link.

	TAG SECTION
	- Shows the tag name, description, and its operations as method and
	  path.

	OPERATION
	- Left column: summary title, Auth required badge, description,
	  inputs, and responses.
	- Right column: a dark method and path bar and the example card.
	- Hairlines separate operations.

		INPUTS
		- Path, query, header, and body each form a section.
		- The body header shows required and content type
		  badges.
		- A field row shows name, type and format,
		  constraints, required, description, and its example
		  on hover.

		RESPONSES
		- Each status is a foldable row with a content type
		  badge.
		- An open row shows the description, the type or model
		  name, and its fields.

		EXAMPLE CARD
		- One tab per response status shows example JSON for its
		  schema.
		- Examples use examples, example, default, enum, format,
		  then type.
		- Copy copies the example; Show schema shows the raw
		  schema.

	SCHEMAS
	- Objects, arrays, and $ref models render as field rows.
	- A closed nested object shows its model name and first field
	  names.
	- Opening it shows its fields indented, as deep as the schema goes.
	- Arrays show their item type, like array of Project.
	- allOf merges; oneOf and anyOf list their variants.
	- Recursive references stop at a link to the model.

	MODELS
	- Each model shows its fields like request bodies.

VERSION 2
- Adds sending real requests from the docs, like Scalar's Test Request.
- Reference screenshot: api-docs-v2-test-request.webp.

	REQUEST PANEL
	- Each operation has a Test request button that opens the panel.
	- A method and URL bar with a Send button; Cmd or Ctrl+Enter sends.
	- Requests go to the spec's first server URL, else the page origin.

	AUTH
	- One Bearer token field applies to every auth route.
	- It shows in the Introduction and in the panel; both edit one token.
	- The token is remembered in localStorage.
	- The cookie token works automatically on the same origin.

	INPUTS
	- Path and query params are key and value rows, each switchable.
	- Headers start with accept and content-type application/json.
	- A JSON body editor starts with the example from the schema.
	- Inputs start from the schema examples.

	RESULT
	- Shows status code and text, time in ms, and size.
	- The body shows as pretty JSON, with a raw view.
	- Request and response headers show collapsed.
	- Failed requests explain likely causes: server down or CORS.
	- Escape or the close button closes the panel.

LATER
- Dark mode, Copy as Markdown, and search.

LEAVE OUT
- Ask AI Agent, Generate MCP, code samples, telemetry, and branding.
