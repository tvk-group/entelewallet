'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import Link from 'next/link';
import { ROUTES } from '@entelewallet/config';
import { Button } from '@entelewallet/ui';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  message: string | null;
}

/** Catches wallet UI render errors so the whole app does not white-screen. */
export class WalletErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[WalletErrorBoundary]', error, info.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <p className="font-semibold">{this.props.fallbackTitle ?? 'Wallet connection failed'}</p>
          <p className="mt-1 text-red-800">
            {this.props.fallbackMessage ?? 'Please refresh the page or try another wallet.'}
          </p>
          {process.env.NODE_ENV === 'development' && this.state.message && (
            <p className="mt-2 font-mono text-xs text-red-700">{this.state.message}</p>
          )}
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-3"
            onClick={() => this.setState({ hasError: false, message: null })}
          >
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export function WalletErrorFallback({
  title = 'Something went wrong',
  message = 'The wallet interface encountered an unexpected error. Please refresh the page or contact support.',
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      <p className="mt-3 text-slate-600">{message}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button type="button" onClick={() => window.location.reload()}>
          Refresh page
        </Button>
        <Link href={ROUTES.security}>
          <Button type="button" variant="secondary">
            Security Center
          </Button>
        </Link>
        <Link href={ROUTES.support}>
          <Button type="button" variant="outline">
            Contact Support
          </Button>
        </Link>
      </div>
    </div>
  );
}
