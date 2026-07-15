# EnteleWALLET Portfolio — Task List (Screens + API Contracts)

Handoff document for the EnteleWALLET team. Tracks the seven portfolio screens, EnteleKRON platform API contracts, deep-link entry, and phased implementation checklist.

## Deep link

```
https://entelewallet.app/?source=entelekron&view=wallet&sync=portfolio
```

| Param | Value | Behavior |
|-------|-------|----------|
| `source` | `entelekron` | Marks entry from EnteleKRON investor dashboard |
| `view` | `wallet` | Opens wallet portfolio view (`/assets`) |
| `sync` | `portfolio` | Triggers portfolio refresh + preference sync from EnteleKRON APIs |

## Seven screens

| # | Screen | Section | Key UI |
|---|--------|---------|--------|
| 1 | Wallet home | Header | Display mode dropdown, total USD card, empty state |
| 2 | Your holdings | Balances | Symbol, network, price, balance, value — **only `hasBalance === true`** |
| 3 | Auto-discovered tokens | Discovery | Alchemy ERC-20 discovery + disclaimer |
| 4 | Live market assets | Market | Holdings-first / all-market display modes |
| 5 | Watchlist | Tracking | Editor chips + price table (default: SUI, ADA, MNT, BlockDAG) |
| 6 | Ecosystem tokens | TVK | ENK, SOVRA, ENM + lockup/vesting links |
| 7 | Network switcher | Chains | Ethereum, Base, Mantle (**full**); Sui, Cardano, BlockDAG (**price-only v1**) |

### Screen notes

**1 — Wallet home**
- Reuses connected wallet identicon + truncated address
- Total USD reflects listed/market-quoted assets; ecosystem tokens without quotes show partial-total disclaimer
- Display mode selector: `holdings-first` (default) | `all-market`

**2 — Your holdings**
- Table rows: symbol, network badge, spot price, formatted balance, USD value
- Filter: `hasBalance === true` only (hide zero-balance configured tokens)
- Sort: USD value descending, ENK pinned first on EnteleKRON view

**3 — Auto-discovered tokens**
- Shown when `preferences.autoDiscoverEnabled === true`
- Source: Alchemy `getTokenBalances` + metadata on Ethereum mainnet (Phase D)
- Disclaimer: unverified contracts, user must hide/dismiss per token
- Hidden when toggle off or no discoveries

**4 — Live market assets**
- `holdings-first`: holdings section first, then catalog assets without balance
- `all-market`: full catalog sorted by market cap / catalog order
- Price via CoinGecko (existing `/api/prices` proxy) or EnteleKRON catalog

**5 — Watchlist**
- Chip editor: add/remove symbols from catalog
- Default symbols: **SUI**, **ADA**, **MNT**, **BlockDAG**
- Price table: symbol, network, 24h change (when available), USD price
- Persisted via `PUT /api/user/watchlist` when authenticated; local fallback in Lite

**6 — Ecosystem tokens**
- ENK (verified contract), SOVRA, ENM cards
- Link to vesting page + EnteleKRON investor dashboard for lockup/vesting detail
- SOVRA/ENM show `pendingOfficialConfiguration` until contracts published

**7 — Network switcher**
- **Full balance support:** Ethereum, Base, Mantle — on-chain reads via wagmi
- **Price-only v1:** Sui, Cardano, BlockDAG — spot prices only, no balance reads
- Badge: `Price only` on non-EVM / v1 chains
- EnteleKRON ecosystem view remains a first-class network (Ethereum chain ID 1)

---

## API contracts (EnteleKRON platform)

**Base URL:** `https://www.entelekron.io`  
**Auth:** Supabase session cookie **or** `Authorization: Bearer <token>`

Environment variable in EnteleWALLET: `NEXT_PUBLIC_ENTELEKRON_URL` (default `https://entelekron.io`).

### `GET /api/wallet/portfolio`

Returns full portfolio snapshot for the authenticated user + connected wallet context.

```typescript
interface PortfolioResponse {
  walletAddress: string;
  preferences: WalletPreferences;
  holdings: PortfolioAsset[];
  discovered?: PortfolioAsset[];
  marketCatalog: PortfolioAsset[];
  watchlist: WatchlistEntry[];
  ecosystem: EcosystemAsset[];
  syncedAt: string;
}

interface PortfolioAsset {
  id: string;
  symbol: string;
  name: string;
  network: string;
  networkId: string;
  chainId?: number;
  contractAddress?: string;
  decimals: number;
  logo?: string;
  coingeckoId?: string;
  priceUsd?: number;
  balance?: string;       // raw base units
  valueUsd?: number;
  hasBalance: boolean;
  fiatQuotePolicy?: 'market' | 'none';
  source: 'configured' | 'discovered' | 'catalog';
}

interface WalletPreferences {
  displayMode: 'holdings-first' | 'all-market';
  networkViewId: string;
  chainId: number;
  autoDiscoverEnabled: boolean;
}

interface WatchlistEntry {
  symbol: string;
  networkId?: string;
  coingeckoId: string;
  catalogId?: string;
}

interface EcosystemAsset {
  symbol: 'ENK' | 'SOVRA' | 'ENM';
  name: string;
  balance?: string;
  valueUsd?: number;
  vestingLinked: boolean;
  lockupSummary?: string;
}
```

**Errors:** `401` unauthenticated · `404` wallet not linked · `503` upstream pricing unavailable

### `GET /api/user/wallet-preferences`

```typescript
type WalletPreferencesResponse = WalletPreferences;
```

### `PATCH /api/user/wallet-preferences`

```typescript
type WalletPreferencesPatch = Partial<WalletPreferences>;
// Returns updated WalletPreferences
```

### `GET /api/user/watchlist`

```typescript
interface WatchlistResponse {
  items: WatchlistEntry[];
  catalog: WatchlistCatalogItem[];
}

interface WatchlistCatalogItem {
  id: string;
  symbol: string;
  name: string;
  networkId: string;
  coingeckoId: string;
  logo?: string;
}
```

### `PUT /api/user/watchlist`

```typescript
// Body: { symbols: string[] }
// Returns WatchlistResponse
```

---

## EnteleWALLET Lite fallback (offline / unauthenticated)

When EnteleKRON APIs return `401` or are unreachable, EnteleWALLET Lite composes portfolio data locally:

| Data | Source |
|------|--------|
| Holdings | wagmi `useBalance` + `useReadContracts` (existing) |
| Prices | `/api/prices` → CoinGecko |
| Preferences | `localStorage` key `entelewallet-portfolio-prefs` |
| Watchlist | `localStorage` key `entelewallet-watchlist` (defaults: SUI, ADA, MNT, BDAG) |
| Discovered | Empty until Phase D (Alchemy) |
| Ecosystem | Token registry ENK / SOVRA / ENM |

---

## Implementation checklist

### Phase A — Read-only parity (current target)

- [x] Task list document (this file)
- [x] Portfolio types + config defaults
- [x] Seven-screen layout on `/assets`
- [x] Holdings table (`hasBalance` filter)
- [x] Display mode dropdown (holdings-first / all-market)
- [x] Watchlist UI with default chips (local persistence)
- [x] Ecosystem tokens section (ENK, SOVRA, ENM)
- [x] Network switcher tier badges (full vs price-only)
- [x] Deep link handler (`source=entelekron&view=wallet&sync=portfolio`)
- [x] EnteleKRON API client with graceful fallback

### Phase B — Preferences sync

- [x] Authenticated `GET/PATCH /api/user/wallet-preferences` (BFF proxy)
- [x] Sync display mode + network across devices
- [x] `PUT /api/user/watchlist` when EnteleKRON session present (BFF proxy)
- [x] Settings page: auto-discover toggle

### Phase C — Multi-chain

- [x] Mantle mainnet (chain ID 5000) full balance reads
- [x] Cross-chain holdings aggregation in total USD card
- [x] Per-network holdings breakdown

### Phase D — Auto-discover

- [x] Alchemy `getTokenBalances` on Ethereum (+ Base, Mantle, Polygon, etc.)
- [x] Token metadata normalization + spam filter
- [x] Disclaimer + hide/dismiss per discovered token
- [x] `preferences.autoDiscoverEnabled` gate

### Phase E — Non-EVM

- [x] Sui address linking (read-only)
- [x] Cardano address linking (read-only)
- [x] BlockDAG balance reads (full tier)
- [x] Upgrade BlockDAG from price-only to full tier

---

## Files (EnteleWALLET repo)

| Area | Path |
|------|------|
| Task list | `docs/ENTELEWALLET-PORTFOLIO-TASKLIST.md` |
| Types | `packages/types/src/portfolio.ts` |
| Defaults / catalog | `packages/config/src/portfolio.ts` |
| Chain tiers | `packages/config/src/chain-registry/chains.json` |
| API client | `apps/web/src/lib/entelekron-api.ts` |
| Preferences | `apps/web/src/lib/portfolio-preferences.ts` |
| Portfolio hook | `apps/web/src/hooks/use-entelekron-portfolio.ts` |
| UI sections | `apps/web/src/components/portfolio/*` |
| Page | `apps/web/src/app/assets/page.tsx` |
| Deep link | `apps/web/src/components/portfolio-sync-handler.tsx` |

---

## QA checklist

1. Connect wallet on Ethereum → holdings show ENK / ETH / USDT with balances
2. Switch to Base → Mantle-ready picker shows tier badges
3. Toggle display mode → market section reorder
4. Watchlist defaults load (SUI, ADA, MNT, BDAG) with prices
5. Deep link opens `/assets` and triggers refresh
6. Disconnect → empty state on wallet home
7. API 401 → local fallback, no console errors
8. `pnpm typecheck` + `pnpm build` pass

## Related docs

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [PHASES.md](./PHASES.md)
- [ENVIRONMENT.md](./ENVIRONMENT.md)
