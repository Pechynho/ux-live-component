# CHANGELOG (fork)

Changelog for the `Pechynho/ux-live-component` fork. Upstream changes are
tracked in [CHANGELOG.md](CHANGELOG.md). Composer consumers reference the fork
via `dev-3.x` (always the latest commit); the versions below refer to
`assets/package.json`.

## 3.5.1-pechynho

- Sync with upstream `v3.5.1` (Idiomorph 0.7.4, `LiveResponse::remove()`,
  file downloads from a LiveAction, external `id` mutation tracking, …).
  Upstream rewrote the history of the `3.x` split, so the automatic sync
  workflow could not merge (every file conflicted as add/add); the rewritten
  `v3.1.0` commit (tree-identical to the one previously merged) was recorded
  with `-s ours` and upstream was then merged on top.
- Custom `data-live-preserve` innerHTML-restore fix re-applied onto the new
  upstream `morphdom.ts` (now wrapped in the external-id `try/finally`).
- `tsconfig.json` aligned with upstream (`strict`, `noUnusedLocals`, target
  ES2022 — the dist now uses native class fields like upstream's); fixed the
  two resulting type errors.
- Sync workflow now fails loudly on rewritten upstream history or when the
  conflict PR cannot be created; actions bumped to Node 22.

## 3.0.1-pechynho

- Fix `X-Live-Url` being applied via `history.replaceState` after the user
  navigated away: a late live response (deferred/lazy render, polling, slow
  server) could rewrite the URL of the history entry the user navigated to.
  The URL update is now skipped when a navigation (`popstate`, `turbo:visit`)
  happened while the request was in flight, or when the component element is
  no longer connected to the document. The rest of the response processing
  (re-render, hooks) is unchanged.
- Standalone unit test setup (`vitest.config.mjs`, `test/setup.js`,
  `yarn test:unit`, `make assets-test`) — upstream's monorepo test runner is
  not available in the fork.

## 3.0.0-pechynho

- Initial fork release on top of upstream `3.x`:
  - `Component.request()` — standalone live action request returning the raw
    `Response` without a re-render
  - `request:started` hook `controls.abortRequest`
  - `response:error` hook `controls.resetLoadingState`
  - `render:started` hook added to the `ComponentHooks` type
  - Exported TypeScript types for all hook callbacks
  - Fix `data-live-preserve` losing DOM state when a parent element's `id`
    changed between re-renders
  - Standalone build setup (tsup) and daily upstream sync workflow
