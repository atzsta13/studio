import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import PwaLoader from '@/components/pwa-loader';
import Header from '@/components/layout/header';
import BottomNav from '@/components/layout/bottom-nav';
import MuiRegistry from '@/components/mui-registry';
import InstallPrompt from '@/components/install-prompt';
import { ThemeProvider } from '@/components/theme-provider';
import { FESTIVAL } from '@/config/festival';

const themeStyle = `
  :root {
    --primary: ${FESTIVAL.theme.primaryHsl};
    --primary-foreground: 0 0% 100%;
    --secondary: ${FESTIVAL.theme.secondaryHsl};
    --secondary-foreground: 0 0% 100%;
    --accent: ${FESTIVAL.theme.accentHsl};
    --accent-foreground: 0 0% 0%;
    --background: ${FESTIVAL.theme.backgroundHsl};
    --card: ${FESTIVAL.theme.cardHsl};
    --card-foreground: 0 0% 100%;
    --muted: 240 4% 16%;
    --muted-foreground: 0 0% 63%;
    --border: 240 4% 16%;
  }
  .text-glow {
    text-shadow: 0 0 20px ${FESTIVAL.theme.glowColor};
  }
`;

export const metadata: Metadata = {
  applicationName: FESTIVAL.appName,
  title: {
    default: FESTIVAL.appName,
    template: `%s | ${FESTIVAL.name} ${FESTIVAL.dates.year}`,
  },
  description: FESTIVAL.description,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: FESTIVAL.appName,
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: FESTIVAL.theme.primaryHex,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&family=Varela+Round&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: themeStyle }} />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <MuiRegistry>
            <PwaLoader />
            <InstallPrompt />
            <div className="relative flex min-h-screen w-full flex-col">
              <Header />
              <main className="flex-1 pb-24 md:pb-0">{children}</main>
              <BottomNav />
            </div>
            <Toaster />
          </MuiRegistry>
        </ThemeProvider>
      </body>
    </html>
  );
}
