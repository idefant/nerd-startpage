# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Nerd Startpage is a keyboard-driven new-tab page browser extension for Firefox and Chrome (Manifest V3). User configuration is a YAML file hosted externally (Gist/Pastebin/etc.) — the extension fetches it by URL, validates it through a Zod schema, and persists the parsed config in `localStorage` via `redux-persist`.

Node version: see `.nvmrc` (currently 22). Use `npm install` for dependencies.

## Commands

Build & dev (uses [Task](https://taskfile.dev) — `task` CLI sets the `TARGET` env var that `vite.config.ts` keys off):

```sh
task dev-firefox     # initial build, then vite watch + web-ext run (Firefox)
task dev-chrome      # initial build, then vite watch + web-ext run (Chromium)
task build-firefox   # production build → dist-firefox/
task build-chrome    # production build → dist-chrome/
```

Direct npm scripts (require `TARGET=firefox` or `TARGET=chrome` set, otherwise defaults to chrome):

```sh
npm run build              # tsc -b && vite build
npm run dev:once           # one-shot dev build
npm run dev:watch          # vite build --watch --mode development
npm run lint               # eslint src
npm run lint:fix
npm run lint:css           # stylelint **/*.(s)?css
npm run lint:css:fix
npm run format             # prettier
npm run schema             # regenerate config.schema.json from the zod schema
npm run storybook          # Storybook on :6006
```

There is no test runner configured. ESLint and Stylelint also run inline via `vite-plugin-checker` during dev builds (errors only, surfaced in the browser overlay).

Pre-commit runs `lint-staged` (eslint on JS/TS, stylelint on CSS/SCSS) — see `.lintstagedrc`.

## Architecture

### Build targets one codebase into two extensions

`vite.config.ts` reads `process.env.TARGET` (`chrome` | `firefox`, default `chrome`) and:

- Outputs to `dist-${target}/` with separate vite caches (`.vite-${target}/`).
- Emits the corresponding `manifest.${target}.json` as `manifest.json` via the inline `manifestPlugin`. **Edit the per-target manifest files at the repo root, not anything in `dist-*`.** Firefox uses MV3 with `background.scripts` + `browser_specific_settings.gecko`; Chrome uses `background.service_worker`.
- Three Rollup entrypoints: `index.html` (the startpage SPA), `load.html` (a shim that runs `src/load.ts` to redirect new-tab → `index.html` — needed because Firefox blocks `chrome_url_overrides.newtab` from pointing directly at an extension page that does heavy work), and `src/background.ts` (extension background script, emitted as `background.js`).

`webextension-polyfill` is used everywhere browser APIs are touched, so the same code runs in both targets.

### Config-driven runtime

Everything user-visible (which modes exist, hotkeys, leader sequences, command-palette membership, categories/links on the dashboard) is driven by the validated config object — there is no hardcoded list of features per UI surface.

Pipeline:

1. User stores `config.yaml` URL in the extension via the `setConfigUrlFromClipboard` command. URL is persisted in the `config` redux slice (`redux-persist` → `localStorage`).
2. `mainApi.fetchConfig` (RTK Query) fetches the URL, parses YAML, strips null values (`removeNullObjectValues`), and runs it through `configSchema` (Zod). Validation failures `toast.error` and abort — **the existing config is preserved**.
3. On success, `configSlice.extraReducers` writes `payload` to `state.config.config`. All UI reads from this slice via `useAppSelector`.

The schema in `src/schema/configSchema.ts` is the source of truth for valid mode/command names, defaults, and the shape consumed downstream. `src/data/mode.ts` and `src/data/command.ts` derive `modeNameList` / `commandNameList` from `modesSchema.unwrap().keyof().options` so they cannot drift from the schema. **When adding a new mode or command, edit the schema first**, then add metadata (title/icon) to the corresponding `*.ts` in `src/data/`, then a hook (for commands) or a `*Suggestions` component (for modes), and finally wire it into `DashboardPage.tsx`. Also run `npm run schema` — `config.schema.json`
(the JSON Schema that gives `config.yaml` autocomplete in editors) is generated from
`configSchema` by `scripts/generate-config-schema.mjs` and must be regenerated whenever the zod
schema changes.

### Mode vs command

- A **mode** owns the suggestion area below the input (Google, Yandex, NPM, history, bookmarks, sessions, links, commandPalette). Each has its own `*Suggestions` component under `src/components/`. `DashboardPage` switches between them based on the `mode` state.
- A **command** is a single fire-and-forget action (`openLinkFromClipboard`, `reloadConfig`, `showMyIP`, …). Implementations live in `src/utils/commands/` (pure helpers) or `src/hooks/use*.ts` (when they need redux/RTK Query). The Command Palette mode lists every non-hidden command + every non-hidden mode.

Both modes and commands share the same trigger surface: a **hotkey** (`useModeHotkey` / `useCommandHotkey`, both built on `react-hotkeys-hook` and gated on the user's config) and an optional **leader sequence** — type `leaderKey` (default `:`) followed by the sequence to invoke a mode or command from the input field. Leader-sequence dispatch lives in `src/hooks/useLeaderSequence.ts` and contains a `commandKey → callback` map that **must be kept in sync** with the command list when commands are added/removed.

### State

- Redux Toolkit + RTK Query. One slice (`configSlice`) and one API (`mainApi`, with endpoints for config, Google/Yandex/NPM suggestions, and myip).
- `redux-persist` persists only the `config` slice. Note: `serializableCheck` is disabled in `store.ts` because RTK Query + persist can flag non-serializable inner state.
- `DashboardContext` (built on `use-context-selector` for fine-grained subscriptions, not React's built-in context) carries the search query, mode setter, and refs into deeply-nested suggestion components.

### Path aliases

`vite.config.ts` and `tsconfig.json` define `#*` aliases for every top-level `src/` directory (`#api`, `#hooks`, `#schema`, `#store`, `#ui`, `#utils`, etc.). Use these — relative `../../` imports are not the convention here. Adding a new top-level directory under `src/` requires updating both files.

### Styling

SCSS modules (`*.module.scss`) + a small set of global stylesheets imported once in `src/main.tsx` (`modern-normalize`, `styles/index.scss`, `styles/global.scss`, `styles/themes/dark.scss`). Stylelint is configured via `.stylelintrc.json` with `stylelint-config-standard-scss`.

## Conventions to follow

- **ESLint config is airbnb-based with custom overrides** in `.eslintrc.json`. Notable: max line length 100 (with strings/templates/regex/comments ignored), arrow-function React components only (`react/function-component-definition`), `import/order` enforced (builtin → external → internal → parent → sibling → index → object → type, alphabetized, newlines between groups), `react-hooks/exhaustive-deps` also tracks a custom `useAsyncEff` hook.
- Prettier is wired into ESLint (`plugin:prettier/recommended`), so `npm run format` and `npm run lint:fix` should agree.
- User-facing toast text in this repo is in Russian (e.g. `'Конфигурация успешно обновлена'`); follow that when adding new toasts.
