# Domain configuration

## Canonical app URL

**Primary:** `https://entelewallet.app`

All alias hostnames should redirect to the apex app domain (not `www.entelewallet.app`).

| Host | Role |
|------|------|
| `entelewallet.app` | Canonical PWA / wallet app |
| `www.entelewallet.app` | Redirect → `entelewallet.app` |
| `app.entelewallet.com` | Redirect → `entelewallet.app` |
| `wallet.entelekron.io` | Redirect → `entelewallet.app` |
| `entelewallet.org` | Redirect → `entelewallet.app` (security center alias) |
| `entelewallet.com` | Marketing site (same deployment, different branding) |

## Vercel Domains (fix common mistake)

If `app.entelewallet.com` shows **308 → www.entelewallet.app**, that is incorrect and can break access when `www` DNS is missing or stale.

### Correct setup

In **Vercel → Project → Settings → Domains**:

1. **`entelewallet.app`** — Connect to **Production**
2. **`www.entelewallet.app`** — Either:
   - **Redirect** to `https://entelewallet.app`, or
   - Connect to **Production** (app middleware redirects `www` → apex)
3. **`app.entelewallet.com`** — Either:
   - **Redirect** to `https://entelewallet.app` (**not** `www.entelewallet.app`), or
   - Connect to **Production** (app middleware redirects alias → apex)

### Wrong (do not use)

```
app.entelewallet.com  →  www.entelewallet.app   ❌
```

### Right

```
app.entelewallet.com  →  entelewallet.app       ✅
www.entelewallet.app  →  entelewallet.app       ✅
```

After changing Vercel domain targets, redeploy and verify:

```bash
curl -sI https://app.entelewallet.com | grep -i location
# location: https://entelewallet.app/
```

## Environment variables

```env
NEXT_PUBLIC_APP_URL=https://entelewallet.app
NEXT_PUBLIC_APP_ALIAS_URL=https://app.entelewallet.com
```

## WalletConnect / Reown allowlist

Add these origins in [Reown Cloud](https://cloud.reown.com):

- `https://entelewallet.app`
- `https://app.entelewallet.com`

## DNS at registrar

For `entelewallet.app` on Vercel, use Vercel nameservers or:

| Type | Name | Value |
|------|------|-------|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

Use the exact records shown in the Vercel Domains panel for your project.
