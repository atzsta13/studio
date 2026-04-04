import { FESTIVAL_CONFIGS, getFestivalConfig } from '@/config/festival';
import Header from '@/components/layout/header';
import BottomNav from '@/components/layout/bottom-nav';
import { OfflineBanner } from '@/components/layout/offline-banner';
import { InsiderProvider } from '@/components/insider-provider';
import { ErrorBoundary } from '@/components/error-boundary';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  return Object.keys(FESTIVAL_CONFIGS).map((id) => ({
    festivalId: id,
  }));
}

export default async function FestivalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ festivalId: string }>;
}) {
  const { festivalId } = await params;
  
  if (!FESTIVAL_CONFIGS[festivalId]) {
    notFound();
  }

  const config = getFestivalConfig(festivalId);

  const themeStyle = `
    :root {
      --primary: ${config.theme.primaryHsl};
      --secondary: ${config.theme.secondaryHsl};
      --accent: ${config.theme.accentHsl};
      --background: ${config.theme.backgroundHsl};
      --card: ${config.theme.cardHsl};
    }
    .text-glow {
      text-shadow: 0 0 20px ${config.theme.glowColor};
    }
  `;

  return (
    <InsiderProvider festivalId={festivalId}>
      <style dangerouslySetInnerHTML={{ __html: themeStyle }} />
      {config.features.offlineBanner && <OfflineBanner />}
      <div className="relative flex min-h-screen w-full flex-col">
        <Header festivalId={festivalId} />
        <main className="flex-1 pb-24 md:pb-0">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
        <BottomNav festivalId={festivalId} />
      </div>
    </InsiderProvider>
  );
}
