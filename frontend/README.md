# Nextstep — plain frontend design

This folder contains only HTML, CSS, and vanilla JavaScript for the selected green design. There is no React, Vite, JSX, dependency installation, or build step. The frontend developer can use it as the reference for the future React implementation.

## Preview

From the repository root:

```sh
node frontend/serve.mjs
```

Open http://127.0.0.1:5173. Stop the server with Ctrl+C. This optional server uses only Node built-ins and serves this folder; it does not start Express or connect to MongoDB. You can also use a static server such as VS Code Live Server. No npm install is required for the design.

## Files

- `index.html`: selected green landing page and frontend entry point.
- `styles.css`: base typography and landing styles.
- `workspace.css`: full workspace, sidebar, forms, and responsive layouts.
- `dark.css`: neutral charcoal dark mode with green accents.
- `app.js`: landing markup, shared utilities, and sample application storage.
- `workspace.js`: vanilla JS navigation, demo session, application CRUD, overview, and settings.
- `serve.mjs`: optional dependency-free static preview server.

## Flow and handoff

Landing → Log in / Get started → Enter demo workspace → full-page applications screen. The sidebar includes Overview, Applications, and Settings. Calendar is marked for later. Application creation and editing use full pages; the application list supports search, status filtering, inline status changes, and confirmed deletion. The landing dashboard is illustrative; the workspace counts reflect editable data.

Routes use hashes (`#/workspace/applications`). Sign-in is a clearly labeled demo, with no passwords collected. Session state is stored in sessionStorage; applications are stored in localStorage under `nextstep-demo-v1`. This is not secure authentication or a backend integration. Real accounts, authenticated CRUD, per-user data isolation, admin authorization, calendar, and reminders remain for the team to implement. Google Fonts have system fallbacks.

The existing backend, root dependencies, and Docker configuration are separate and unchanged.
