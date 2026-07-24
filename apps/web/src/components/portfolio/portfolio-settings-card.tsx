'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@entelewallet/ui';
import { useT } from '@/lib/i18n-context';
import { useLinkedAddresses } from '@/hooks/use-linked-addresses';
import { PortfolioDisplayModeSelect } from '@/components/portfolio/portfolio-display-mode';
import { loadSyncedPreferences, patchLocalPreferences } from '@/lib/wallet-preferences-sync';
import type { PortfolioDisplayMode } from '@entelewallet/types';
import { useEffect } from 'react';

interface PortfolioSettingsCardProps {
  onPreferencesChange?: () => void;
}

export function PortfolioSettingsCard({ onPreferencesChange }: PortfolioSettingsCardProps) {
  const t = useT();
  const { linked, saveLinked, clearLinked } = useLinkedAddresses();
  const [displayMode, setDisplayMode] = useState<PortfolioDisplayMode>('all-market');
  const [autoDiscover, setAutoDiscover] = useState(false);
  const [suiDraft, setSuiDraft] = useState(linked.sui ?? '');
  const [adaDraft, setAdaDraft] = useState(linked.cardano ?? '');
  const [linkError, setLinkError] = useState<string | null>(null);

  useEffect(() => {
    void loadSyncedPreferences().then((prefs) => {
      setDisplayMode(prefs.displayMode);
      setAutoDiscover(prefs.autoDiscoverEnabled);
    });
  }, []);

  useEffect(() => {
    setSuiDraft(linked.sui ?? '');
    setAdaDraft(linked.cardano ?? '');
  }, [linked.sui, linked.cardano]);

  const persist = async (patch: Parameters<typeof patchLocalPreferences>[0]) => {
    await patchLocalPreferences(patch);
    onPreferencesChange?.();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.portfolioTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-900">{t('settings.displayMode')}</p>
            <p className="text-xs text-slate-500">{t('settings.displayModeHint')}</p>
          </div>
          <PortfolioDisplayModeSelect
            value={displayMode}
            onChange={(mode) => {
              setDisplayMode(mode);
              void persist({ displayMode: mode });
            }}
          />
        </div>

        <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-slate-200 p-4">
          <div>
            <p className="text-sm font-medium text-slate-900">{t('settings.autoDiscover')}</p>
            <p className="mt-1 text-xs text-slate-500">{t('settings.autoDiscoverHint')}</p>
          </div>
          <input
            type="checkbox"
            checked={autoDiscover}
            onChange={(e) => {
              const enabled = e.target.checked;
              setAutoDiscover(enabled);
              void persist({ autoDiscoverEnabled: enabled });
            }}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-cyan-600"
          />
        </label>

        <div className="space-y-3 rounded-xl border border-slate-200 p-4">
          <p className="text-sm font-medium text-slate-900">{t('settings.linkedAddresses')}</p>
          <p className="text-xs text-slate-500">{t('settings.linkedAddressesHint')}</p>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600">{t('settings.suiAddress')}</label>
            <div className="flex gap-2">
              <input
                value={suiDraft}
                onChange={(e) => setSuiDraft(e.target.value)}
                placeholder={t('settings.suiPlaceholder')}
                className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs"
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setLinkError(null);
                  const ok = saveLinked({ sui: suiDraft.trim() || undefined });
                  if (!ok && suiDraft.trim()) setLinkError(t('settings.invalidSuiAddress'));
                }}
              >
                {t('common.save')}
              </Button>
              {linked.sui && (
                <Button size="sm" variant="ghost" onClick={() => clearLinked('sui')}>
                  {t('common.clear')}
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600">
              {t('settings.cardanoAddress')}
            </label>
            <div className="flex gap-2">
              <input
                value={adaDraft}
                onChange={(e) => setAdaDraft(e.target.value)}
                placeholder={t('settings.cardanoPlaceholder')}
                className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs"
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setLinkError(null);
                  const ok = saveLinked({ cardano: adaDraft.trim() || undefined });
                  if (!ok && adaDraft.trim()) setLinkError(t('settings.invalidCardanoAddress'));
                }}
              >
                {t('common.save')}
              </Button>
              {linked.cardano && (
                <Button size="sm" variant="ghost" onClick={() => clearLinked('cardano')}>
                  {t('common.clear')}
                </Button>
              )}
            </div>
          </div>

          {linkError && <p className="text-xs text-red-600">{linkError}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
