import type { Connector } from 'wagmi';
import { WALLETCONNECT_ALLOWED_ORIGINS } from '@entelewallet/config';

type RainbowKitConnector = Connector & {
  isWalletConnectModalConnector?: boolean;
  rkDetails?: { isWalletConnectModalConnector?: boolean };
};

export function getCurrentOrigin(): string {
  if (typeof window === 'undefined') return '';
  return window.location.origin;
}

export function isWalletConnectOriginAllowed(origin: string): boolean {
  if (!origin) return true;
  return (WALLETCONNECT_ALLOWED_ORIGINS as readonly string[]).includes(origin);
}

/** RainbowKit registers a dedicated WalletConnect connector with QR modal support. */
export function findWalletConnectModalConnector(
  connectors: readonly Connector[],
): Connector | undefined {
  return connectors.find((connector) => {
    const rk = connector as RainbowKitConnector;
    return (
      connector.id === 'walletConnect' &&
      (rk.isWalletConnectModalConnector === true ||
        rk.rkDetails?.isWalletConnectModalConnector === true)
    );
  });
}

export function findAnyWalletConnectConnector(
  connectors: readonly Connector[],
): Connector | undefined {
  return connectors.find((c) => c.type === 'walletConnect' || c.id === 'walletConnect');
}

export function describeConnector(connector: Connector): string {
  const rk = connector as RainbowKitConnector;
  const modal = rk.isWalletConnectModalConnector ?? rk.rkDetails?.isWalletConnectModalConnector;
  return `${connector.name} · id=${connector.id} · type=${connector.type}${modal ? ' · modal' : ''}`;
}
