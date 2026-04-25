# Parity Checklist

Use this checklist before merging changes that touch layout, animation, data, platform adapters, or bundled assets. Automated checks prove source boundaries and pure data logic; visual and gesture parity still require manual review in the browser.

| Area | What to Check | Expected Behavior | Coverage |
| --- | --- | --- | --- |
| Login screen | Initial layout, title copy, input spacing, focused input shadow, login button state, keyboard lift on mobile Safari | Identical to current SDRS-RNW web app; no selected UI text; focused input keeps original shadow | Manual |
| Auth transition | Login to main and logout transition | Same opacity/scale/timing/easing; no unexpected background flashes | Manual |
| Main app shell | Canvas size, phone frame, background, safe-area behavior | Same light/dark canvas, centered desktop frame, full mobile viewport | Manual |
| Bottom tab bar | DB, 데이터 관리, 메뉴 labels/icons, active colors, press overlay, fixed position | Same spacing, icon alignment, active tab color, no tab darkening after returning from subpages | Manual |
| Screen transitions | Tab switches, submenu push/pop, reduced-motion mode | Same direction, easing, scale, opacity, and shadow behavior | Manual |
| Database tab | Browse list, compact/card view, top bar, filters, scroll hiding/reveal | Same top-bar frost/blur/gradient, no blinking, scrollbar behavior unchanged | Manual |
| Database search | Search open/close, clear, Korean/choseong search | Same search bar layout and results; query logic matches Korean/choseong behavior | Manual + `npm run test:run` |
| Ship cards | Card image, info table, equipment icons, empty state | Same image sizing, table borders, icon weights/alignment, empty-state copy | Manual |
| Filter sheet | Harbor/type filters, option widths, background blur, close animation | Same modal layering, label-width transition, selected values, bottom tab behavior | Manual |
| Manage home | File rows, import buttons, alert modal, export action | Same copy, spacing, press states, import/export behavior | Manual |
| Manage edit | Top bar, add button, search, field pills, image picker, save/delete/discard/toast | Same pill sizing/position, icon centering, add/delete animations, toast and modal timing | Manual |
| DB reorder | Long-press, drag anchor, room-making, autoscroll, release settle | Same center anchor, threshold feel, smooth autoscroll, no divider/card teleporting | Manual |
| Menu tab | Menu rows, 화면 모드, 앱 정보, 로그아웃 | Same row height, arrows, details, press guides, Korean text | Manual |
| Menu mode | 시스템 설정/라이트/다크 selection | Default is 시스템 설정; mode toggles and system changes update theme | Manual |
| Menu info | Logo, mark, version, back behavior | Same background, logo sizing, vertical spacing, back button | Manual |
| Image zoom modal | Open thumbnail origin, close button, swipe/pinch/pan/double tap, close-to-thumbnail | Same modal background, image persistence, close button appearance, gestures and transitions | Manual |
| Loading states | Initial DB load and lazy-loaded subpages | No full white vanish; lazy screens appear with existing transition feel | Manual |
| Error states | CSV/ZIP import errors and discard warnings | Same Korean copy, modal layout, danger/neutral button styles | Manual |
| Import CSV | Valid and invalid `ship.csv` import | Same validation, merge/replace prompt, row/header errors | Manual + `npm run test:run` for CSV helpers |
| Import images.zip | Valid and invalid image ZIP import | Same extension validation, image matching by registration, failure copy | Manual |
| Export database/images | Export ZIP contents and download behavior | Exports `ship.csv` and `images.zip` exactly as current web behavior | Manual |
| Bundled data | Default `ship.csv`, `images.zip`, `no-image.svg` | Files exist, non-empty, and default DB can seed from them | `npm run audit:data` |
| Theme | Light/dark/system, local persistence | Same tokens, no stale dark tab, system mode tracks OS setting | Manual |
| Mobile viewport | iOS Safari and Android Chrome narrow viewport | No body scroll jump, safe areas and keyboard behavior preserved | Manual |
| Desktop viewport | Wide browser viewport | Same centered phone frame and shadow | Manual |
| Narrow viewport | Width <= 480px | Same full-screen mobile layout and no horizontal overflow | Manual |
| Korean text/font | Korean copy, font weight, letter spacing | Pretendard GOV renders correctly; no accidental text changes | Manual |
| Material icons | All Material Symbols/Icons glyphs | Same glyphs, weights, optical centering, fallback-free load | Manual |
| Press/focus/hover states | Buttons, rows, icons, pills, tabs | Same tap overlay afterimage, no browser blue focus/tap rectangle | Manual |
| Back behavior | Manage/menu subpages and discard confirmation | Same pop animation and dirty-state warning behavior | Manual |
| Scroll behavior | DB list, manage list, add-card scroll, top bar scroll | Same scroll positions, no hidden cards, added card fully revealed | Manual |
| Source hygiene | DOM wrapper removal and browser API boundary | No active wrapper refs; browser APIs confined to platform web boundary | `npm run audit:dom`, `npm run audit:browser-apis` |
| Production build | Vite build output | Build completes without warnings/errors from removed DOM directives | `npm run build` |
| Full validation | Combined audits, tests, build | All configured checks pass | `npm run validate` |
