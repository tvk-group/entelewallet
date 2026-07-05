# WalletConnect Debug Log — EnteleWALLET Lite

This document tracks WalletConnect runtime issues, reproduction steps, and fixes applied.

## Reported production issue

| Field | Value |
|-------|--------|
| **Symptom** | Full-page crash: `Application error: a client-side exception has occurred` |
| **When** | User clicks **Connect Wallet → WalletConnect** |
| **Domains** | `https://app.entelewallet.com`, `https://entelewallet.app` |
| **Stack** | RainbowKit + wagmi + viem (Reown AppKit **not** used in connect path) |

## Most likely causes (investigated)

| Cause | Status / fix |
|-------|----------------|
| Missing or invalid `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Config now validates 32-char hex Reown ID; WalletConnect hidden when invalid; app loads with browser-only fallback |
| Custom wallet button / manual `connectAsync()` | **Removed** — standard `<ConnectButton />` only |
| Unhandled promise rejection on connect | Global `unhandledrejection` handler in `WalletProviders` |
| No error boundary | Added `app/error.tsx`, `app/global-error.tsx`, `WalletErrorBoundary` |
| Broken connector with placeholder project ID | WalletConnect wallet omitted from list unless valid Reown project ID |
| SSR / hydration (`window`, `localStorage`) | Wallet UI gated with `mounted` state before render |

## Local reproduction

```bash
cd /workspace
pnpm --filter @entelewallet/web dev
```

1. Open `http://localhost:3000`
2. Open DevTools → Console
3. Click **Connect Wallet** → **WalletConnect** (Mobile / QR group)
4. For isolated test: `http://localhost:3000/dev/walletconnect-test` (development only)

### Environment checklist

```bash
# .env.local
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<32-char hex from Reown Cloud>
NEXT_PUBLIC_APP_URL=https://entelewallet.app
```

Project ID source: **[Reown Cloud](https://cloud.reown.com)** (formerly WalletConnect Cloud).

### Reown allowlist (required)

```
https://entelewallet.app
https://app.entelewallet.com
https://wallet.entelekron.io
http://localhost:3000
http://localhost:3001
```

## Fix applied (branch `cursor/fix-walletconnect-crash-487b`)

1. **`apps/web/src/components/wallet-connect-button.tsx`** — Standard RainbowKit `ConnectButton` only; safety modal before first connect; no manual connector calls
2. **`apps/web/src/lib/wagmi.ts`** — Safe config with try/catch fallback; WalletConnect only when valid Reown project ID
3. **`apps/web/src/lib/web3-provider.tsx`** — `WalletProviders` + unhandled rejection handler; `reconnectOnMount={false}`
4. **`apps/web/src/components/wallet-error-boundary.tsx`** — Wallet UI error boundary
5. **`apps/web/src/app/error.tsx`**, **`global-error.tsx`** — App-wide error UI (no default Next.js white screen)
6. **`apps/web/src/app/dev/walletconnect-test/page.tsx`** — Dev-only isolated ConnectButton test
7. **Removed** `wallet-connect-test-button.tsx` (direct `connectAsync` could crash app)

## Expected behavior after fix

| Scenario | Expected |
|----------|----------|
| Missing project ID | App loads; WalletConnect option hidden; dev warning shown |
| Invalid project ID | Same as missing |
| Valid project ID + allowed origin | WalletConnect QR opens via RainbowKit |
| User rejects connection | Error message; app does not crash |
| WalletConnect / modal failure | Error card or error boundary; refresh available |
| Wrong origin (dev) | Warning in debug panel; connection may fail gracefully |

## Browser QA matrix

| Browser | Connect Wallet | WalletConnect QR | Notes |
|---------|----------------|------------------|-------|
| Chrome desktop | ☐ | ☐ | |
| Firefox desktop | ☐ | ☐ | |
| Edge desktop | ☐ | ☐ | |
| Safari iPhone | ☐ | ☐ | deep link / WC mobile |
| Chrome Android | ☐ | ☐ | |

## Vercel deployment

Ensure `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set for **Production**, **Preview**, and **Development** environments, then redeploy.

Support: security@entelewallet.com
