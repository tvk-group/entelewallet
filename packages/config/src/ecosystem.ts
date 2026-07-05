/**
 * Canonical EnteleKRON / TVK Group ecosystem project list (28 modules).
 * Aligned with entelekron.io, entelekron.org, and tvk.group official listings.
 */
export type EcosystemProjectStatus =
  | 'live'
  | 'development'
  | 'planned'
  | 'future'
  | 'concept'
  | 'experimental';

export type EcosystemProjectCategory =
  | 'core'
  | 'infrastructure'
  | 'identity'
  | 'security'
  | 'ai'
  | 'energy'
  | 'human'
  | 'operations'
  | 'social'
  | 'experimental';

export type EcosystemProject = {
  id: string;
  /** Short label for animation chips and compact UI */
  label: string;
  /** Full official product name */
  name: string;
  category: EcosystemProjectCategory;
  status: EcosystemProjectStatus;
};

/** Official 28 ecosystem projects — single source of truth */
export const ECOSYSTEM_PROJECTS = [
  { id: 'enk', label: 'ENK', name: 'ENK', category: 'core', status: 'live' },
  { id: 'sovra-ai', label: 'SOVRA AI', name: 'SOVRA AI', category: 'ai', status: 'development' },
  { id: 'energiemind', label: 'EnergieMIND', name: 'EnergieMIND', category: 'energy', status: 'planned' },
  { id: 'enm', label: 'ENM', name: 'ENM', category: 'energy', status: 'planned' },
  { id: 'entelewallet', label: 'EnteleWALLET', name: 'EnteleWALLET', category: 'infrastructure', status: 'live' },
  { id: 'entelescan', label: 'EnteleSCAN', name: 'EnteleSCAN', category: 'infrastructure', status: 'development' },
  { id: 'entelelink', label: 'EnteleLINK', name: 'EnteleLINK', category: 'infrastructure', status: 'planned' },
  { id: 'enteleledger', label: 'EnteleLEDGER', name: 'EnteleLEDGER', category: 'infrastructure', status: 'planned' },
  { id: 'enteleclos', label: 'EnteleCLOS', name: 'EnteleCLOS', category: 'security', status: 'planned' },
  { id: 'entelevault', label: 'EnteleVAULT', name: 'EnteleVAULT', category: 'security', status: 'planned' },
  { id: 'tvk-id', label: 'TVK ID', name: 'TVK ID', category: 'identity', status: 'planned' },
  { id: 'graphvault', label: 'GraphVault', name: 'GraphVault', category: 'infrastructure', status: 'planned' },
  { id: 'chronoseal', label: 'ChronoSeal', name: 'ChronoSeal', category: 'infrastructure', status: 'planned' },
  { id: 'q-presence', label: 'Q-Presence', name: 'Q-Presence', category: 'human', status: 'planned' },
  { id: 'cerebthra', label: 'Cerebthra', name: 'Cerebthra', category: 'ai', status: 'development' },
  { id: 'cognethra', label: 'Cognethra', name: 'Cognethra', category: 'ai', status: 'future' },
  { id: 'syntherra', label: 'SYNTHERRA', name: 'SYNTHERRA', category: 'ai', status: 'future' },
  { id: 'sentient-signals', label: 'Sentient Signals', name: 'Sentient Signals', category: 'ai', status: 'development' },
  { id: 'tvk-cyberlab', label: 'TVK CyberLab', name: 'TVK CyberLab', category: 'security', status: 'development' },
  { id: 'tvk-labs', label: 'TVK Labs', name: 'TVK Labs & Technologies', category: 'operations', status: 'live' },
  { id: 'tvk-group-tr', label: 'TVK Group Türkiye', name: 'TVK Group Türkiye', category: 'operations', status: 'live' },
  { id: 'tvk-wallet', label: 'TVK Wallet', name: 'TVK Wallet', category: 'infrastructure', status: 'development' },
  { id: 'tvk-group', label: 'TVK Group', name: 'TVK Group', category: 'operations', status: 'live' },
  { id: 'alvina', label: 'ALVINA', name: 'ALVINA', category: 'human', status: 'development' },
  { id: 'ava-sentient', label: 'Ava Sentient', name: 'Ava Sentient', category: 'human', status: 'development' },
  { id: 'ava-sante', label: 'Ava Santé', name: 'Ava Santé', category: 'human', status: 'development' },
  { id: 'puppykron', label: 'PuppyKRON', name: 'PuppyKRON', category: 'social', status: 'concept' },
  {
    id: 'kron-assets',
    label: 'KRON Assets',
    name: 'KRON Ecosystem Assets',
    category: 'experimental',
    status: 'experimental',
  },
] as const satisfies readonly EcosystemProject[];

export const ECOSYSTEM_PROJECT_COUNT = ECOSYSTEM_PROJECTS.length;

/** Chip labels for the cyber-coin animation */
export const ECOSYSTEM_MODULE_LABELS = ECOSYSTEM_PROJECTS.map((p) => p.label);

/** Domains where the ecosystem animation should be deployed */
export const ECOSYSTEM_ANIMATION_SITES = [
  'https://entelewallet.app',
  'https://entelekron.io',
  'https://entelekron.org',
  'https://tvk.group',
] as const;
