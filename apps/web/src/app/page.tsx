import { Suspense } from 'react';
import { HomePageContent } from './home-page-content';

function HomePageFallback() {
  return (
    <div className="embed-mode-bg flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-pulse rounded-full bg-accent/30" />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomePageFallback />}>
      <HomePageContent />
    </Suspense>
  );
}
