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
- Colors, sizes, spacing, and 0.5px hairlines live in src/global.css.
- Uses the system fonts.
- Uses px units, flat CSS Modules, and the frontend skill's targets.
- Descriptions show runs of all-caps words with one of five or more
  letters in bold, like RECEIPTS FIRST, and a label that starts a
  paragraph, like WHEN.; abbreviations like VAT stay plain.

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
- examples/openapi.json is the example spec for development.

TESTS
- node --test covers spec reading, examples, Markdown, and the MCP client.
- The UI is checked in the browser, narrow and wide.

VERSION 1
- A read-only reference: sidebar and every route, without sending
  requests.

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
	- Groups fold; the group of the operation in view opens, with its
	  title in a heavier weight.
	- Models list the components.schemas keys.
	- The entry of the operation in view is highlighted.

	DEEP LINKS
	- Operations, tags, and models have hash links, like
	  #tag/projects/POST/projects.
	- Opening a link scrolls to its target; scrolling updates the hash.
	- Arrow down and up bring the next or previous section to the top;
	  up inside a long section first returns to its start.
	- Arrows keep their usual job in fields and dialogs, and with
	  modifier keys.

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
- Adds sending real requests from the docs.

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

VERSION 3
- Adds MCP servers: the docs act as an MCP client, as ChatGPT does.
- Tools are documented from their own MCP definitions, never from OpenAPI.

	MODE
	- A REST API and MCP switch at the top of the sidebar shows one of
	  them, never both.
	- A link opens the docs it points into; without one, the last choice.
	- MCP connects the first time it is shown.

	MCP PATH
	- In MCP, a field below the switch sets the endpoint, default /mcp.
	- A path is relative to the server base; a full URL works too.
	- The last value is remembered in localStorage.
	- Enter connects, or reconnects, and jumps to the server section.

	CONNECTION
	- Streamable HTTP: one JSON-RPC message per POST, answered as JSON
	  or an event stream.
	- Sends initialize, notifications/initialized, tools/list, and
	  resources/list, following nextCursor pages.
	- Sends the Bearer token, and the Mcp-Session-Id and
	  MCP-Protocol-Version headers once known.
	- The lists are kept until the page reloads or Reload is pressed.
	- A 401 asks for the Bearer token, with the token field and Reload.

	SERVER SECTION
	- Shows the server name, version, protocol version, instructions,
	  the endpoint, and Reload.
	- Cards: the Bearer token, the tools, and the resources.

	GROUPS
	- Tools group by _meta.group, like Receipts, in first appearance
	  order; tools without one form a Tools group.
	- Each group starts with a section listing its tools, like a tag.

	SIDEBAR
	- Lists Server, then one foldable entry per group.
	- Entries show the title, else the name, with a TOOL badge.
	- Links look like #mcp/tool/add_receipt.

	TOOL
	- Left column: title, hint pills, description, Arguments from
	  inputSchema, and Result from outputSchema.
	- Hint pills: read-only, destructive, idempotent, and view.
	- Right column: a dark TOOL and name bar, and an example card with
	  Arguments and Result tabs.
	- Schema refs resolve inside the schema itself, like #/$defs/Item.

	TOOL TEST PANEL
	- A JSON arguments editor starts with the inputSchema example.
	- Send calls tools/call; Cmd or Ctrl+Enter sends.
	- Shows time, size, HTTP status, and whether the tool failed.
	- Tabs: View, Result (structuredContent), Content, and Raw reply.
	- Content shows text, images, and embedded files to download.
	- JSON-RPC errors, tool errors, and failed requests read clearly.

	VIEW
	- A tool whose _meta names a ui:// resource renders it after a
	  successful call, as an MCP Apps host.
	- The view HTML comes from resources/read.
	- It runs in an iframe sandboxed to allow-scripts only, so it
	  cannot read the stored token.
	- A CSP from the resource's _meta.ui.csp blocks other network use.
	- Handles ui/initialize, tool input and result notifications, size
	  changes, tools/call, resources/read, open-link, download-file,
	  message, and update-model-context.
	- A log under the view lists its requests and their outcome.

VERSION 4
- Adds appearance settings, remembered in localStorage.

	SIDEBAR FOOTER
	- A light and dark toggle, and a settings button that opens a small
	  dialog.

	SETTINGS
	- Theme: auto, light, or dark; auto follows the system and its
	  changes.
	- Zoom: 50 to 200 percent in 1 percent steps, with CSS zoom on the
	  page; browsers without CSS zoom keep their own zoom.
	- Both apply before the first paint.

	SIDEBAR WIDTH
	- Dragging the sidebar's right edge sets its width, 200 to 480 px.
	- Arrow keys on the edge change it; double-click restores 288 px.
	- Narrow screens keep the menu sidebar at the default width.

	DARK MODE
	- Colors are light and dark tokens in src/global.css.
	- Views get the theme in hostContext and a host-context-changed
	  notification when it changes.

LATER
- Copy as Markdown and search.

LEAVE OUT
- Ask AI Agent, Generate MCP, code samples, telemetry, and branding.
