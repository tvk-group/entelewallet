# WalletConnect Setup — EnteleWALLET Lite

EnteleWALLET Lite uses **RainbowKit + wagmi + viem** only. WalletConnect is provided through RainbowKit’s `walletConnectWallet` connector — there is no separate Reown AppKit integration in the connection path.

## 1. Environment variable

Set in Vercel (Production + Preview) and local `.env`:

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_32_char_reown_project_id
NEXT_PUBLIC_APP_URL=https://entelewallet.app
NEXT_PUBLIC_APP_ALIAS_URL=https://app.entelewallet.com
```

The project ID must be a **32-character hex string** from [Reown Cloud](https://cloud.reown.com) (formerly WalletConnect Cloud). Set as:

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_reown_project_id
```

See also: [WALLETCONNECT_DEBUG.md](./WALLETCONNECT_DEBUG.md)

If the variable is missing:

- **Development:** a warning is shown; WalletConnect is hidden from the wallet list.
- **Production:** users see “WalletConnect is temporarily unavailable…” — browser extension wallets still work.

## 2. Allowed origins (required)

In the Reown Cloud dashboard for your project, add **exactly** these origins to the allowlist:

```text
https://entelewallet.app
https://app.entelewallet.com
https://wallet.entelekron.io
http://localhost:3000
http://localhost:3001
```

Requests from origins not on this list can be **denied**, which causes WalletConnect to fail silently or with a generic error on production domains.

After changing the allowlist, wait a few minutes and hard-refresh the app.

## 3. Expected connection flow

1. User clicks **Connect Wallet**
2. Safety notice (first session) → checkbox → Continue
3. RainbowKit wallet modal opens
4. Under **Mobile / QR**, user selects **WalletConnect**
5. On desktop: RainbowKit shows a QR code (or Reown modal when `showQrModal` is active on the modal connector)
6. User scans with a mobile wallet

WalletConnect must work **without** a browser extension installed.

## 4. Development debugging

On `/connect` in `NODE_ENV=development`:

- **Wallet debug panel** — origin, project ID, connectors, wagmi status
- **Test WalletConnect QR** — connects directly via the WalletConnect modal connector

If the test button fails, check:

1. `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set and valid (32 hex chars)
2. Current origin is in the allowlist above
3. Browser popup / modal blockers are disabled
4. Dev server was restarted after env changes

## 5. Stack rules

- ✅ RainbowKit `@rainbow-me/rainbowkit`
- ✅ wagmi v2
- ✅ viem
- ✅ `@tanstack/react-query`
- ❌ Do not add Reown AppKit alongside RainbowKit for the same connect flow
- ❌ Do not call `openConnectModal()` in `useEffect` on page load
- ✅ `reconnectOnMount` on `WagmiProvider` (default) — wallet stays connected across page refresh until disconnect

## 6. Honest wallet list

**Browser Wallets:** injected (EIP-6963), MetaMask, Rabby, Coinbase extension, OKX

**Mobile / QR:** WalletConnect only

Rainbow, Trust Wallet, Ledger Live, MetaMask Mobile, etc. connect **through WalletConnect**, not as direct desktop buttons.

Base Account is disabled (`NEXT_PUBLIC_ENABLE_BASE_ACCOUNT=false`).

## 7. Troubleshooting

| Symptom | Likely cause |
|--------|----------------|
| WalletConnect option missing | Invalid or missing project ID |
| Click does nothing | Wrong Reown project ID in Vercel build, or origin not allowlisted |
| QR never appears | Popup blocked; or project ID invalid |
| Works locally, fails on Vercel | `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` missing at **build** time — app falls back to embedded project ID; ensure Vercel env matches your Reown project (`7eb3d2a4…`) |
| Stuck on “Connecting wallet…” | Connection timeout — use Reset wallet state on `/connect` |

Support: security@entelewallet.com
