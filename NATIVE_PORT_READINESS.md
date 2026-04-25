# Native Port Readiness

## Current Status

SDRS-RNW is a Vite + React Native Web app with the former DOM wrapper screen layer removed from active source. The web UI still uses the same feature screens, layout styles, Korean copy, bundled data, and RNW behavior.

The codebase is now organized so the browser-only runtime pieces are visible and replaceable for a future Expo / pure React Native APK port.

## Clean Now

- `src/dom/` does not exist.
- Active source imports feature screens/components directly from `src/features` and `src/components`.
- No active source/config/script file contains a removed DOM wrapper directive or wrapper import.
- `node_modules/`, `dist/`, local build folders, logs, env files, and temporary files are ignored by `.gitignore`.
- `ship.csv`, `images.zip`, and `no-image.svg` remain required bundled data and are validated by script.
- `src/domain/importExport/bundledData.js` is pure file-to-state logic; Vite URL/fetch/File creation lives in the web platform layer.

Historical planning docs may still mention deleted `src/dom/*` files as migration history. The active audit intentionally scans source, scripts, package scripts, and config files, not archival Markdown.

## Platform Boundary Files

- `src/platform/index.js`: web runtime helpers used by app/UI code.
- `src/platform/files.js`: web file picker, download, and image-file reading exports.
- `src/platform/storage.js`: web persistence exports.
- `src/platform/bundledData.js`: web bundled seed exports.
- `src/platform/web/browser.js`: `window`, `document`, `matchMedia`, `visualViewport`, DOM rect, CSS escaping, pointer capture, storage preference, event-listener, and timing helpers.
- `src/platform/web/files.js`: web file input, object URL download, and `FileReader`.
- `src/platform/web/storage.js`: IndexedDB persistence.
- `src/platform/web/bundledData.js`: Vite asset URL loading, `fetch`, `Blob`, and `File` creation for `ship.csv` and `images.zip`.
- `src/platform/index.native.js`: native placeholder runtime boundary.
- `src/platform/files.native.js`: native placeholder for document picking, file reading, export/share.
- `src/platform/storage.native.js`: native placeholder for persistence.
- `src/platform/bundledData.native.js`: native placeholder for Expo asset seed loading.
- `src/platform/native/README.md`: native replacement notes.

## Browser APIs Remaining

The browser API audit allows these only inside `src/platform/web/*`:

- Mount/runtime: `document`, `window`, `HTMLElement`.
- Viewport/theme/accessibility: `visualViewport`, `matchMedia`, browser event listeners, localStorage.
- Layout and image transitions: `getBoundingClientRect`, CSS escaping, pointer capture.
- Import/export: hidden file input, `FileReader`, `Blob`/`File`, object URLs, download anchors.
- Persistence: IndexedDB.

Some RNW components still rely on RNW-specific styling primitives such as CSS variables, CSS shadows, CSS transitions, and web-compatible style values. Those are necessary for current pixel parity and will need native equivalents later.

## Native Equivalents

- Web IndexedDB/local persistence -> Expo SQLite, AsyncStorage, or Expo FileSystem.
- Web file input -> `expo-document-picker`.
- Web download/export anchors -> `expo-file-system` plus `expo-sharing`.
- Web Blob/object URL image handling -> Expo FileSystem URI or Image URI management.
- Web `visualViewport`/window dimensions -> React Native `Dimensions` or `useWindowDimensions`.
- Web hover/focus/tap highlight details -> React Native `Pressable` state and accessibility states.
- Web fonts -> Expo Font loading for Pretendard GOV assets.
- Web Material Symbols font -> bundled TTF/OTF through Expo Font or an icon component equivalent.
- Web DOM measurement/thumbnail query -> native ref measurement and gesture primitives.

## Bundled Data

These files must remain present and non-empty:

- `ship.csv`
- `images.zip`
- `no-image.svg`

Validation:

```sh
npm run audit:data
```

## Validation Commands

```sh
npm run audit:dom
npm run audit:data
npm run audit:browser-apis
npm run test:run
npm run build
npm run validate
```

Compatibility aliases are still available:

```sh
npm run check:dom
npm run check:bundled-data
npm run check:native-readiness
```

## Remaining APK Blockers

- Implement real `src/platform/*.native.js` behavior instead of placeholder errors.
- Choose and implement the native persistence backend.
- Replace Vite asset URLs with Expo asset loading for `ship.csv`, `images.zip`, and `no-image.svg`.
- Replace browser file input/download flows with Expo document picker, filesystem, and sharing flows.
- Replace DOM rect/query-based image zoom and reorder measurements with native ref measurement and gesture handling.
- Port CSS variable/token styling and local fonts into native style/theme/font-loading infrastructure.
- Add device-level visual/gesture validation once an Expo app shell exists.

## Known Parity Risks

No visual redesign is part of this cleanup. Automated checks cover source boundaries, bundled data presence, build, and pure domain tests. Pixel-perfect parity still requires manual web verification for:

- Image zoom open/close origin and pinch/pan/dismiss behavior.
- Long-press DB card reorder and autoscroll.
- Top bar scroll/frost/blur behavior.
- Screen push/pop and tab transition feel.
- Mobile Safari viewport and keyboard behavior.
