# EnteleWALLET Lite Upgrade Audit (2026-07-05)

## Findings (before upgrade)

| Area          | Issue                                                                            | Status           |
| ------------- | -------------------------------------------------------------------------------- | ---------------- |
| Wallet modal  | Header used raw `ConnectButton` (English); body used custom button; z-index risk | Fixed            |
| WalletConnect | Dummy project ID when missing; no prod warning                                   | Fixed            |
| i18n          | `generate-locales.mjs` polluted DE with "Verbinden Wallet"; partial locales      | Fixed            |
| ENK token     | `pendingOfficialConfiguration`, no contract address                              | Fixed → verified |
| Transparency  | All addresses pending, no ENK contract                                           | Fixed            |
| Support       | mailto only, misleading success, no Supabase API                                 | Fixed            |
| Design        | Basic template, no brand tokens, minimal animation                               | Fixed            |
| PWA           | No manifest, no install page                                                     | Fixed            |
| Pre-connect   | No checkbox gate before wallet connect                                           | Fixed            |
| Legal         | Only `/legal`; missing privacy/terms/risk/disclaimer                             | Fixed            |

## Fixes applied

- `packages/config/src/officialAddresses.ts` — ENK verified + public address registry
- `packages/config/src/tokens.ts` — ENK contract `0xC95343B3f8A5af57a9b3B1acFf3D2a7654Fa28F6`
- `packages/config/src/support.ts` — supabase/mailto/formspree provider config
- Unified `WalletConnectButton` in header; RainbowKit `locale` synced with app i18n
- Pre-connect safety panel with required acknowledgement checkbox
- Premium design tokens, animations (CSS + reduced-motion), PWA manifest
- Support API `/api/support/report` with Supabase + mailto fallback
- Full footer, language dropdown modal, ecosystem + install pages
