'use client';

import { PageLayout } from '@/components/page-layout';
import { HomeHero } from '@/components/home/home-hero';
import {
  HomeSafetyBar,
  HomeWhatItDoes,
  HomeWhatItDoesNot,
  HomeEcosystemMap,
  HomeSecurityTimeline,
  HomeEnkPreview,
  HomePwaSection,
} from '@/components/home/home-sections';
import { EmbedAppShell } from '@/components/integration/embed-app-shell';
import { EntelekronSourceBanner } from '@/components/integration/entelekron-source-banner';
import { useEmbedRouting } from '@/lib/use-embed-routing';

export function HomePageContent() {
  const { isEmbedMode, fromEntelekron } = useEmbedRouting();

  if (isEmbedMode) {
    return (
      <PageLayout hideTitle fullWidth>
        <div className="embed-mode-bg flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-8">
          <EmbedAppShell />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout hideTitle fullWidth>
      <div className="space-y-20 pb-8 lg:space-y-28">
        {fromEntelekron && (
          <div className="mx-auto max-w-3xl">
            <EntelekronSourceBanner />
          </div>
        )}
        <HomeHero />
        <HomeSafetyBar />
        <HomeWhatItDoes />
        <HomeWhatItDoesNot />
        <HomeEcosystemMap />
        <HomeSecurityTimeline />
        <HomeEnkPreview />
        <HomePwaSection />
      </div>
    </PageLayout>
  );
}
