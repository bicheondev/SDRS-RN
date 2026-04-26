# Native Runtime Shell

Phase 1 adds an Expo runtime shell around the existing React Native Web app without editing UI files. Phase 3 prepares Android EAS development and preview builds without changing the existing screen code.

## Entry

- `package.json` points Expo at `src/native/AppEntry.js`.
- `src/native/AppEntry.js` installs small `atob`/`btoa` polyfills used by existing import/export domain code, then registers `NativeRuntimeShell`.
- `src/native/NativeRuntimeShell.jsx` currently renders a visible native diagnostic screen before the real SDRS UI is mounted.
- `app.json` sets `expo.extra.router.root` to `app` so Expo CLI does not auto-detect the existing `src/app` RNW shell as an Expo Router route directory.

## Metro Boundary

`metro.config.js` redirects explicit web/platform imports to native boundary files:

- `src/platform/*.js` -> `src/platform/*.native.js`
- `src/adapters/storage.web.js` -> `src/platform/storage.native.js`
- `src/adapters/bundledSeed.web.js` -> `src/platform/bundledData.native.js`
- SVG URI imports -> `src/assets/**/*.native.js`

This keeps `src/features/**`, `src/components/**`, and `src/app/**` unchanged for Phase 1.

## Remaining Native Parity Work

The Expo shell does not redesign or simplify the UI. The Phase 4 preview APK diagnostic intentionally does not mount `RnwApp` yet; this avoids a white screen with no fallback while the native-safe mount path is identified. Later phases still need explicit native treatment for web-only style values, DOM-based zoom/reorder measurements, and screen/component parity validation on devices.

## Android EAS Builds

`npm run native:start` starts Metro and is long-running. Leave it running only when a development build is connecting to the local bundler; stop it with Ctrl+C when finished.

Do not rely on Expo Go for Android validation. Expo Go SDK 55 may not open this SDK 54 project. Use an EAS development build for Metro-connected testing, or a preview APK for installable Android testing.

APK commands:

```sh
npx eas-cli build --platform android --profile development
npx eas-cli build --platform android --profile preview
```

Production Android output is configured as an app bundle:

```sh
npx eas-cli build --platform android --profile production
```

No dedicated adaptive icon foreground asset is present yet. `app.json` keeps the Android adaptive icon background opaque and documents the missing foreground asset as a placeholder for a later asset pass.
