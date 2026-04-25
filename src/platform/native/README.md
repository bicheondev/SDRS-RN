# Native Platform Boundary

These files are the Expo / pure React Native boundary for Phase 1. The current production web target still runs through Vite and `src/platform/web/`; native imports are redirected by `metro.config.js` without changing the existing UI files.

Current native responsibilities:

- `index.native.js`: React Native `Dimensions`, `Appearance`, timing, and no-DOM helper fallbacks.
- `files.native.js`: `expo-document-picker`, `expo-file-system`, and `expo-sharing` adapters.
- `storage.native.js`: Expo FileSystem-backed JSON persistence.
- `bundledData.native.js`: Expo Asset/FileSystem loading for the default `ship.csv` and `images.zip`.
- `src/assets/**/*.native.js`: URI bridge modules for SVG assets that existing UI imports as URI strings.

Do not import these native modules from the web build. Keep native-only changes in the platform/native boundary until a later UI parity phase explicitly permits screen and component edits.
