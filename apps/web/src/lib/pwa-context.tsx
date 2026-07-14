'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

interface PwaContextValue {
  isStandalone: boolean;
  isMobile: boolean;
  isAppMode: boolean;
  showInstallPrompts: boolean;
}

const PwaContext = createContext<PwaContextValue>({
  isStandalone: false,
  isMobile: false,
  isAppMode: false,
  showInstallPrompts: true,
});

function detectStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const mq = window.matchMedia('(display-mode: standalone)').matches;
  const ios = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  return mq || ios;
}

function detectMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 767px)').matches;
}

export function PwaProvider({ children }: { children: ReactNode }) {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => {
      setIsStandalone(detectStandalone());
      setIsMobile(detectMobile());
    };
    update();

    const standaloneMq = window.matchMedia('(display-mode: standalone)');
    const mobileMq = window.matchMedia('(max-width: 767px)');
    standaloneMq.addEventListener('change', update);
    mobileMq.addEventListener('change', update);
    return () => {
      standaloneMq.removeEventListener('change', update);
      mobileMq.removeEventListener('change', update);
    };
  }, []);

  const value = useMemo(
    () => ({
      isStandalone,
      isMobile,
      isAppMode: isStandalone || isMobile,
      showInstallPrompts: !isStandalone,
    }),
    [isStandalone, isMobile],
  );

  return <PwaContext.Provider value={value}>{children}</PwaContext.Provider>;
}

export function usePwa() {
  return useContext(PwaContext);
}
