# Native Runtime Shell

Phase 1 adds an Expo runtime shell around the existing React Native Web app without editing UI files.

## Entry

- `package.json` points Expo at `src/native/AppEntry.js`.
- `src/native/AppEntry.js` installs small `atob`/`btoa` polyfills used by existing import/export domain code, then registers `NativeRuntimeShell`.
- `src/native/NativeRuntimeShell.jsx` preloads bundled fonts and renders the existing `RnwApp`.

## Metro Boundary

`metro.config.js` redirects explicit web/platform imports to native boundary files:

- `src/platform/*.js` -> `src/platform/*.native.js`
- `src/adapters/storage.web.js` -> `src/platform/storage.native.js`
- `src/adapters/bundledSeed.web.js` -> `src/platform/bundledData.native.js`
- SVG URI imports -> `src/assets/**/*.native.js`

This keeps `src/features/**`, `src/components/**`, and `src/app/**` unchanged for Phase 1.

## Remaining Native Parity Work

The Expo shell does not redesign or simplify the UI. Later phases still need explicit native treatment for web-only style values, DOM-based zoom/reorder measurements, and screen/component parity validation on devices.
