#!/usr/bin/env node
/**
 * Sync official chain and token logos from Trust Wallet Assets (GitHub).
 * Run: node scripts/sync-chain-icons.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ICONS_DIR = join(ROOT, 'apps/web/public/icons');
const CHAINS_DIR = join(ICONS_DIR, 'chains');
const TOKENS_DIR = join(ICONS_DIR, 'tokens');

const TW_BASE =
  'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains';

/** Registry chain id -> Trust Wallet blockchain folder name */
const CHAIN_SOURCES = {
  ethereum: 'ethereum',
  base: 'base',
  polygon: 'polygon',
  bnb: 'smartchain',
  arbitrum: 'arbitrum',
  optimism: 'optimism',
  avalanche: 'avalanchec',
  linea: 'linea',
  scroll: 'scroll',
  zksync: 'zksync',
  blast: 'blast',
  fantom: 'fantom',
  gnosis: 'xdai',
  mantle: 'mantle',
};

/** Token icon downloads: [outputName, blockchain, contractAddress] */
const TOKEN_SOURCES = [
  ['usdt-ethereum', 'ethereum', '0xdAC17F958D2ee523a2206206994597C13D831ec7'],
  ['usdc-ethereum', 'ethereum', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'],
  ['usdc-base', 'base', '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'],
  ['usdc-polygon', 'polygon', '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359'],
  ['usdt-bnb', 'smartchain', '0x55d398326f99059fF775485246999027B3197955'],
  ['usdc-arbitrum', 'arbitrum', '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'],
  ['usdc-optimism', 'optimism', '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85'],
  ['usdc-avalanche', 'avalanchec', '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E'],
];

async function download(url) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function syncChainIcon(registryId, twBlockchain) {
  const url = `${TW_BASE}/${twBlockchain}/info/logo.png`;
  const data = await download(url);
  const out = join(CHAINS_DIR, `${registryId}.png`);
  await writeFile(out, data);
  console.log(`✓ chain ${registryId}.png`);
  return `/icons/chains/${registryId}.png`;
}

async function syncTokenIcon(name, blockchain, address) {
  const checksum = address;
  const url = `${TW_BASE}/${blockchain}/assets/${checksum}/logo.png`;
  const data = await download(url);
  const out = join(TOKENS_DIR, `${name}.png`);
  await writeFile(out, data);
  console.log(`✓ token ${name}.png`);
  return `/icons/tokens/${name}.png`;
}

async function main() {
  await mkdir(CHAINS_DIR, { recursive: true });
  await mkdir(TOKENS_DIR, { recursive: true });

  const chainPaths = {};
  for (const [id, tw] of Object.entries(CHAIN_SOURCES)) {
    try {
      chainPaths[id] = await syncChainIcon(id, tw);
    } catch (err) {
      console.warn(`⚠ chain ${id}: ${err.message}`);
    }
  }

  const tokenPaths = {};
  for (const [name, blockchain, address] of TOKEN_SOURCES) {
    try {
      tokenPaths[name] = await syncTokenIcon(name, blockchain, address);
    } catch (err) {
      console.warn(`⚠ token ${name}: ${err.message}`);
    }
  }

  console.log('\nSynced chain icons:', Object.keys(chainPaths).length);
  console.log('Synced token icons:', Object.keys(tokenPaths).length);
  console.log('\nUpdate chains.json icon fields to .png paths for synced chains.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
