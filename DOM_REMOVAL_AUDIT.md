# DOM Removal Audit

## Final State

- DOM wrapper architecture removed: yes.
- `src/dom/` directory present: no.
- Active imports from deleted DOM wrapper files: no.
- Active removed wrapper directives: no.
- Browser APIs remaining for RNW runtime: yes, isolated in `src/platform/web/*`.

Historical Markdown planning files may mention the removed wrapper paths. Those are not active imports and are excluded from the source audit.

## Active Audit

Run:

```sh
npm run audit:dom
```

The audit scans:

- `src/`
- `scripts/`
- `package.json`
- `vite.config.js`

It ignores generated folders and documentation archives. It fails if active source/config/script files contain removed DOM wrapper directives or wrapper path imports.

## Removed Wrapper Files

The active app no longer imports these deleted wrapper modules:

- `src/dom/AnimatedScreenDom.jsx`
- `src/dom/BottomTabDom.jsx`
- `src/dom/DatabaseDom.jsx`
- `src/dom/ImageZoomDom.jsx`
- `src/dom/ManageHomeDom.jsx`
- `src/dom/ManageShipEditDom.jsx`
- `src/dom/MenuDom.jsx`
- `src/dom/MenuInfoDom.jsx`
- `src/dom/MenuModeDom.jsx`

## Current Rendering Path

- App shell: `src/app/RnwMainAppShell.jsx`
- Bottom tabs: `src/components/layout/BottomTab.jsx`
- Screen transitions: `src/components/layout/AnimatedScreen.jsx`
- Login/auth: `src/auth/RnwAuthScreen.jsx`, `src/auth/RnwAuthRouteStage.jsx`
- Database: `src/features/database/*`
- Data management: `src/features/manage/*`
- Menu: `src/features/menu/*`
- Image zoom modal: `src/components/ImageZoomModal.jsx`

These modules render through React Native / React Native Web primitives and shared style/token files.

## Remaining Browser Runtime Boundary

Browser-specific logic remains intentionally for RNW web parity:

- `src/platform/web/browser.js`: web runtime, viewport, theme, event, measurement, CSS escape, pointer capture, and storage-preference helpers.
- `src/platform/web/files.js`: hidden file input, file reading, object URL download.
- `src/platform/web/storage.js`: IndexedDB persistence.
- `src/platform/web/bundledData.js`: Vite asset URLs and `File` creation for bundled seed loading.

Run:

```sh
npm run audit:browser-apis
```

The browser API audit fails if the tracked browser APIs appear outside the approved web platform boundary.

## Native Blockers

- Native storage adapter is still a placeholder.
- Native bundled seed loading is still a placeholder.
- Native file import/export is still a placeholder.
- Image zoom and DB reorder still need native measurement/gesture implementations for APK.
- CSS-variable-driven RNW styling still needs native token/style mapping for Expo.
