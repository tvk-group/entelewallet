export type OfficialAddressCategory =
  | 'token_contract'
  | 'treasury'
  | 'presale'
  | 'liquidity'
  | 'vesting'
  | 'ecosystem'
  | 'governance'
  | 'operations'
  | 'wallet_app';

export type OfficialAddressStatus =
  | 'verified'
  | 'pending_verification'
  | 'internal_only'
  | 'archived'
  | 'not_published';

export interface OfficialAddress {
  id: string;
  name: string;
  category: OfficialAddressCategory;
  network: string;
  address: string | null;
  explorerUrl: string | null;
  status: OfficialAddressStatus;
  publicVisibility: boolean;
  purpose: string;
  safetyNote: string;
  lastVerified?: string;
  decimals?: number;
  maxSupply?: string;
}

const ENK_CONTRACT = '0xC95343B3f8A5af57a9b3B1acFf3D2a7654Fa28F6';
const ETHERSCAN_TOKEN = `https://etherscan.io/token/${ENK_CONTRACT}`;

/** Single source of truth — sync with EnteleKRON platform when available. */
export const OFFICIAL_ADDRESSES: OfficialAddress[] = [
  {
    id: 'enk_contract',
    name: 'ENK Token Contract',
    category: 'token_contract',
    network: 'Ethereum',
    address: ENK_CONTRACT,
    explorerUrl: ETHERSCAN_TOKEN,
    status: 'verified',
    publicVisibility: true,
    purpose: 'Official EnteleKRON (ENK) ERC-20 token contract on Ethereum mainnet.',
    safetyNote: 'Verify this address in EnteleWALLET or entelekron.io before any interaction.',
    lastVerified: '2026-01-01',
    decimals: 18,
    maxSupply: '100000000000',
  },
  {
    id: 'treasury_safe',
    name: 'Treasury Safe',
    category: 'treasury',
    network: 'Ethereum',
    address: null,
    explorerUrl: null,
    status: 'pending_verification',
    publicVisibility: true,
    purpose: 'Ecosystem treasury multisig — pending official publication from EnteleKRON.',
    safetyNote: 'Do not send funds until verified inside official EnteleKRON dashboards.',
  },
  {
    id: 'presale_safe',
    name: 'Presale Safe',
    category: 'presale',
    network: 'Ethereum',
    address: null,
    explorerUrl: null,
    status: 'pending_verification',
    publicVisibility: true,
    purpose: 'Presale allocation multisig — pending official publication.',
    safetyNote: 'Payments only through approved EnteleKRON investor dashboard instructions.',
  },
  {
    id: 'liquidity_safe',
    name: 'Liquidity Safe',
    category: 'liquidity',
    network: 'Ethereum',
    address: null,
    explorerUrl: null,
    status: 'pending_verification',
    publicVisibility: true,
    purpose: 'Liquidity reserve multisig — pending official publication.',
    safetyNote: 'Never trust addresses from social media or DMs.',
  },
  {
    id: 'vesting_safe',
    name: 'Vesting Safe',
    category: 'vesting',
    network: 'Ethereum',
    address: null,
    explorerUrl: null,
    status: 'pending_verification',
    publicVisibility: true,
    purpose: 'Vesting allocation multisig — pending official publication.',
    safetyNote: 'Vesting details require linked investor account.',
  },
  {
    id: 'ecosystem_reserve_safe',
    name: 'Ecosystem Reserve Safe',
    category: 'ecosystem',
    network: 'Ethereum',
    address: null,
    explorerUrl: null,
    status: 'pending_verification',
    publicVisibility: true,
    purpose: 'Ecosystem reserve multisig — pending official publication.',
    safetyNote: 'Verify on entelekron.io/transparency when published.',
  },
  {
    id: 'governance_safe',
    name: 'Governance Safe',
    category: 'governance',
    network: 'Ethereum',
    address: null,
    explorerUrl: null,
    status: 'pending_verification',
    publicVisibility: true,
    purpose: 'Governance multisig — pending official publication.',
    safetyNote: 'Governance participation follows official EnteleKRON announcements only.',
  },
];

export function getPublicOfficialAddresses(): OfficialAddress[] {
  return OFFICIAL_ADDRESSES.filter((a) => a.publicVisibility && a.status !== 'internal_only');
}

export function getVerifiedPublicAddresses(): OfficialAddress[] {
  return getPublicOfficialAddresses().filter((a) => a.status === 'verified' && a.address);
}
