'use client';

import { useEffect, useRef } from 'react';
import { useAccount, useDisconnect } from 'wagmi';

const DEFAULT_IDLE_MS = 3 * 60 * 1000;

function getIdleMs(): number {
  const raw = process.env.NEXT_PUBLIC_WALLET_IDLE_MS?.trim();
  const parsed = raw ? Number(raw) : NaN;
  if (Number.isFinite(parsed) && parsed >= 60_000) return parsed;
  return DEFAULT_IDLE_MS;
}

const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'touchstart', 'scroll', 'visibilitychange'] as const;

/**
 * Disconnects the wallet after a period of inactivity (default 3 minutes).
 */
export function WalletIdleGuard() {
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const lastActivityRef = useRef(Date.now());
  const idleMs = getIdleMs();

  useEffect(() => {
    if (!isConnected) return;

    const markActive = () => {
      lastActivityRef.current = Date.now();
    };

    const onActivity = () => {
      if (document.visibilityState === 'hidden') return;
      markActive();
    };

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, onActivity, { passive: true });
    }

    const interval = window.setInterval(() => {
      if (document.visibilityState === 'hidden') return;
      if (Date.now() - lastActivityRef.current >= idleMs) {
        disconnect();
      }
    }, 15_000);

    markActive();

    return () => {
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, onActivity);
      }
      window.clearInterval(interval);
    };
  }, [isConnected, disconnect, idleMs]);

  return null;
}
