# WalletConnect Debug Log — EnteleWALLET Lite

## Confirmed root cause (2026-07-05)

**Symptom:** Full-page error UI — “Something went wrong” — when clicking **WalletConnect** in the RainbowKit modal.

**Exact console error:**

```text
Error: invalid border=0
    at encodeQR (qr/index.js)
    at Module.create (cuer/_dist/QrCode.js)
    at Root (cuer/_dist/Cuer.js)
    at QRCode (RainbowKit dist/index.js)
```

**What happens:**

1. User clicks WalletConnect in the RainbowKit wallet list.
2. RainbowKit renders its inline `QRCode` component (via `cuer`).
3. `cuer@0.0.3` calls `encodeQR(..., { border: 0 })` to build a raw QR grid for SVG rendering.
4. **`qr@0.6.0`** (resolved via `cuer`'s `qr: ~0` range) now rejects `border <= 0` and throws `invalid border=0`.
5. React 19 treats this as an uncaught render error → `global-error.tsx` shows the recovery screen.

This is **not** primarily a missing Reown Project ID issue (though that must still be configured in production). It is a **`cuer` ↔ `qr@0.6.0` dependency incompatibility** triggered whenever RainbowKit tries to render a WalletConnect QR code.

**Secondary issue:** `WalletDebugPanel` caused hydration mismatch (`origin: —` on server vs `http://localhost:3000` on client). Fixed with client-only mount.

---

## Fix applied

### 1. Pin `qr` to `0.5.5` (`package.json` → `pnpm.overrides`)

`qr@0.6.0` rejects `border: 0`, which `cuer` (RainbowKit's QR renderer) requires. Pinning restores compatibility.

### 2. RainbowKit patch (`patches/@rainbow-me__rainbowkit@2.2.11.patch`)

Guard `QRCode` when `uri` is empty — show “Preparing QR code…” instead of crashing.

### 3. Hydration fix

`WalletDebugPanel` only renders after client mount.

### 4. Error boundaries

`app/error.tsx`, `app/global-error.tsx`, `WalletErrorBoundary` — recovery UI instead of raw Next.js crash.

### 5. Standard ConnectButton only

No custom connector `connectAsync()` calls in production UI.

---

## Reproduction (local)

```bash
pnpm install
cd apps/web && NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<reown_project_id> pnpm dev
node ../../scripts/test-walletconnect-click.mjs
```

Or manually:

1. Open `/connect`
2. Accept safety checkbox
3. Click Connect Wallet → WalletConnect

---

## Production checklist

| Check                     | Action                                                                                                         |
| ------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Reown Project ID          | Set `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` in Vercel (32-char hex from [Reown Cloud](https://cloud.reown.com)) |
| Allowlist                 | Add `https://entelewallet.app`, `https://app.entelewallet.com`, `https://wallet.entelekron.io`                 |
| Patch + override deployed | Ensure `pnpm install` runs in CI/Vercel so RainbowKit patch and `qr@0.5.5` override apply                      |
| Redeploy                  | Required after env or patch changes                                                                            |

---

## Browser QA

| Browser         | Connect Wallet | WalletConnect (no crash) | QR appears |
| --------------- | -------------- | ------------------------ | ---------- |
| Chrome desktop  | ☐              | ☐                        | ☐          |
| Firefox desktop | ☐              | ☐                        | ☐          |
| Edge desktop    | ☐              | ☐                        | ☐          |
| Safari iPhone   | ☐              | ☐                        | ☐          |

Support: security@entelewallet.com
