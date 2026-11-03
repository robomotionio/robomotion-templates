# Robomotion App

A web app whose backend is a Robomotion flow, run by a robot. The app and the
flow share one contract, `app.json`, and talk over the Robomotion Apps runtime.

An app is a flow with screens in front of it, and both live in ONE repository:
the flow's. This folder, `app/`, holds the screens; the contract and the flow
sit one level up. `git clone` the flow and you have the whole app.

This scaffold starts as the **dashboard** archetype, running on sample data, so
it renders fully before the flow behind it exists.

## Layout

| Path | What it is |
|---|---|
| `../app.json` | The contract: actions, events, types, screens. The single source of truth, at the project root where the robot reads it. |
| `../mcp.json` | Optional: instructions and tool descriptions for the app's assistant. |
| `../main.ts`, `../subflows/` | The flow that serves the actions. |
| `../src/generated/actions.gen.ts` | The flow-side typed client generated from the contract. Committed, never hand-edited. |
| `src/main.tsx` | Mounts the app frame and the screen router. |
| `src/screens.tsx` | The route table. Paths mirror the screens in `app.json`. |
| `src/pages/` | One screen per file, flat. |
| `src/components/` | One component per file, flat. No index files that only re-export. |
| `src/generated/actions.gen.ts` | The app-side typed client generated from the contract. Committed, never hand-edited. |
| `src/lib/config.ts` | Runtime configuration for production and local dev. |
| `src/lib/router.tsx` | Minimal path routing on the History API, no extra packages. Screens are real paths, never `#/`. |
| `archetypes/` | Complete screen sets for four common app shapes (see below). Reference only: not part of the app build or typecheck. |
| `vendor/` | The two Robomotion packages, placed by the tooling. Ignored by git. |
| `../.robomotion/` | Session files the tooling writes (`dev-session.json`, `dev-server.json`). Ignored by git. |

## Working on it

```sh
cd app
bun install
bun run dev        # Vite on http://localhost:5173
bun run typecheck  # tsc --noEmit over src/; must stay clean
bun run typecheck:archetypes  # the sample sets under archetypes/, checked separately
bun run build      # typecheck plus a production build
bun run codegen    # regenerate both typed clients from ../app.json
```

Saving is `git commit && git push` at the project root, the same as for the
flow; the screens and the flow move together in one commit.

Rules that keep this app maintainable:

- Dependencies are limited to `react`, `react-dom`, `@robomotion/app-kit`,
  `@robomotion/apps-runtime`, and the dev toolchain. The validator rejects
  anything else, so do not add packages.
- `../app.json` and the two `src/generated/actions.gen.ts` files move
  together. Edit the contract, rerun `bun run codegen`, and let the compiler
  find every screen the change breaks. Never edit a generated file by hand.
- Screens read data through the runtime hooks (`useAction`, `useEvent`) and
  build their UI from app-kit components. An app stores nothing of its own:
  the flow owns wherever the data really lives, and a table asks it for one
  page at a time with `<DataTable source={{ action: listThings }} />`. Its
  sample rows are simply what it shows until the flow's first answer lands.
- Shared helpers under `src/lib/` are imported as `@/lib/...`; everything a
  screen owns (its generated types, components) is imported relatively. That
  convention is what lets an archetype run unchanged from `archetypes/` or
  from `src/`.

## Runtime configuration

`src/lib/config.ts` handles both environments through one function:

- **Production**: the serving layer injects `window.env` and a `<base href>`
  for the app's public path; `loadConfig` reads both.
- **Local dev**: the app-kit Vite plugin serves `/__rm/config.json`, built
  from the preview iframe's query parameters and from
  `../.robomotion/dev-session.json`, which is how a preview points this app at
  a draft instance. Plain `vite dev` without the plugin also works and falls
  back to the page URL.

## Archetypes

Each folder under `archetypes/` is a complete, working app shape: its own
`app.json`, generated types, screens, components, and sample data.

- `dashboard`: stat tiles plus a recent-activity table.
- `approval-queue`: pending items, a detail pane, approve and reject.
- `form-and-table`: a form that sends a request and a table of results.
- `document-review`: file upload, reading progress, an editable review form.

To switch this app to another archetype, replace the instantiated files with
that folder's contents (from `app/`):

```sh
cp archetypes/approval-queue/app.json ../app.json
cp archetypes/approval-queue/screens.tsx src/screens.tsx
cp -r archetypes/approval-queue/pages/. src/pages/
cp -r archetypes/approval-queue/components/. src/components/
cp -r archetypes/approval-queue/generated/. src/generated/
cp -r archetypes/approval-queue/lib/. src/lib/
```

Remove the previous archetype's page, component, and lib files first if you
want a clean tree; the file names do not overlap across archetypes.

## How the two Robomotion packages resolve

The app is built on `@robomotion/app-kit` for its interface and
`@robomotion/apps-runtime` for talking to the flow. Those two are the whole
Robomotion surface; everything else is React and the dev toolchain.

Neither package is on npm. `package.json` pins them as
`file:./vendor/robomotion-app-kit` and `file:./vendor/robomotion-apps-runtime`,
with matching entries under `overrides` so every copy in the tree resolves to
the same build, and the tooling places both under `vendor/` before
`bun install` runs: the robot's api-mcp from the skills bundle every robot
already fetches, the `robomotion` CLI from the same bundle. `vendor/` is
ignored by git, so a clone never carries a stale copy.
