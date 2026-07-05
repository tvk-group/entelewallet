'use client';

import { ReactNode } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  hideTitle?: boolean;
}

export function PageLayout({ children, title, description, hideTitle }: PageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
          {!hideTitle && title && (
            <div className="mb-10">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
              {description && (
                <p className="mt-3 max-w-3xl text-lg text-slate-600 leading-relaxed">{description}</p>
              )}
            </div>
          )}
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
