'use client';

import Link from 'next/link';
import {
  ShieldCheck,
  Wallet,
  FileCheck,
  Lock,
  Eye,
  Coins,
  Ban,
} from 'lucide-react';
import { useT } from '@/lib/i18n-context';
import { useAccount } from 'wagmi';
import { useWalletStatus } from '@/lib/wallet-context';
import { ROUTES } from '@entelewallet/config';
import { cn } from '@entelewallet/utils';
import { BrandLogo } from '@/components/brand-logo';

function StatusChip({
  label,
  variant,
}: {
  label: string;
  variant: 'verified' | 'neutral' | 'future' | 'readonly' | 'pending';
}) {
  const styles = {
    verified: 'border-emerald-200/80 bg-emerald-50/90 text-emerald-800',
    neutral: 'border-slate-200/80 bg-white/80 text-slate-700',
    future: 'border-violet-200/80 bg-violet-50/80 text-violet-800',
    readonly: 'border-cyan-200/80 bg-cyan-50/80 text-cyan-900',
    pending: 'border-amber-200/80 bg-amber-50/80 text-amber-900',
  };
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        styles[variant],
      )}
    >
      {label}
    </span>
  );
}

function PreviewRow({
  icon: Icon,
  label,
  value,
  chip,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  chip: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-white/50 bg-white/40 px-3 py-2.5 backdrop-blur-sm">
      <div className="flex min-w-0 items-start gap-2.5">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-900/10 to-violet-600/10">
          <Icon className="h-3.5 w-3.5 text-blue-800" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{label}</p>
          <p className="truncate text-xs font-semibold text-slate-800">{value}</p>
        </div>
      </div>
      {chip}
    </div>
  );
}

export function WalletAppPreview() {
  const t = useT();
  const { isConnected } = useAccount();
  const { isVerified } = useWalletStatus();

  return (
    <div className="wallet-preview-shell relative isolate mx-auto w-full max-w-[420px] overflow-hidden rounded-3xl border border-white/60 bg-white/50 shadow-2xl shadow-blue-900/10 lg:max-w-none">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="hero-glow-drift absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-cyan-400/30 to-violet-500/20 blur-3xl" />
        <div className="hero-glow-drift absolute -bottom-20 -left-12 h-48 w-48 rounded-full bg-gradient-to-tr from-blue-500/20 to-cyan-300/15 blur-3xl [animation-delay:-4s]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,64,175,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(30,64,175,0.04)_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div className="wallet-float relative z-10 p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <BrandLogo variant="icon" className="h-11 w-11" />
            <div>
              <p className="text-sm font-bold text-slate-900">{t('brand.name')}</p>
              <p className="text-[10px] font-medium uppercase tracking-widest text-cyan-700">
                {t('home.previewStatusLayer')}
              </p>
            </div>
          </div>
          <StatusChip label={t('home.statusReadOnly')} variant="readonly" />
        </div>

        <div className="enk-orb-wrap relative mb-4 flex items-center justify-center py-2">
          <div className="enk-orb-spin absolute h-28 w-28 rounded-full border border-dashed border-cyan-300/40" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-800 via-cyan-500 to-violet-600 shadow-lg shadow-cyan-500/30">
            <span className="text-xs font-bold text-white">ENK</span>
          </div>
        </div>

        <div className="space-y-2">
          <PreviewRow
            icon={Wallet}
            label={t('home.previewWalletStatus')}
            value={
              isConnected
                ? isVerified
                  ? t('common.walletVerified')
                  : t('common.walletConnected')
                : t('home.previewConnectToVerify')
            }
            chip={
              <StatusChip
                label={isVerified ? t('home.statusVerified') : t('home.statusFuture')}
                variant={isVerified ? 'verified' : 'neutral'}
              />
            }
          />
          <PreviewRow
            icon={Coins}
            label={t('home.previewEnkContract')}
            value="0xC953…a28F6"
            chip={<StatusChip label={t('home.statusVerified')} variant="verified" />}
          />
          <PreviewRow
            icon={ShieldCheck}
            label={t('home.previewSignatureSafety')}
            value={t('home.previewGaslessProof')}
            chip={<StatusChip label={t('home.statusVerified')} variant="verified" />}
          />
          <PreviewRow
            icon={Eye}
            label={t('home.previewTransparency')}
            value={t('home.previewOfficialOnly')}
            chip={<StatusChip label={t('home.statusReadOnly')} variant="readonly" />}
          />
          <PreviewRow
            icon={FileCheck}
            label={t('home.previewClaims')}
            value={t('claims.notOpen')}
            chip={<StatusChip label={t('home.statusFuture')} variant="future" />}
          />
          <PreviewRow
            icon={Ban}
            label={t('home.previewCustody')}
            value={t('home.previewNotProvided')}
            chip={<StatusChip label={t('home.statusNotCustodial')} variant="pending" />}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[t('home.chipNoSend'), t('home.chipNoSwap'), t('home.chipNoStake')].map((chip) => (
            <span
              key={chip}
              className="rounded-lg border border-slate-200/80 bg-slate-50/80 px-2 py-1 text-[10px] font-medium text-slate-500"
            >
              {chip}
            </span>
          ))}
        </div>

        <Link
          href={ROUTES.transparency}
          className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-cyan-200/60 bg-cyan-50/50 py-2 text-xs font-semibold text-cyan-900 transition hover:bg-cyan-50"
        >
          <Lock className="h-3.5 w-3.5" />
          {t('common.transparencyCenter')}
        </Link>
      </div>
    </div>
  );
}
