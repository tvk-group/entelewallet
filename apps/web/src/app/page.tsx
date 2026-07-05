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

export default function HomePage() {
  return (
    <PageLayout hideTitle fullWidth>
      <div className="space-y-20 pb-8 lg:space-y-28">
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
