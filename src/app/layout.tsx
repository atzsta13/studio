import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import PwaLoader from '@/components/layout/pwa-loader';
import { SwUpdateBanner } from '@/components/layout/sw-update-banner';
import MuiRegistry from '@/components/layout/mui-registry';
import InstallPrompt from '@/components/layout/install-prompt';
import { ThemeProvider } from '@/components/layout/theme-provider';

export const metadata: Metadata = {
  applicationName: 'Festival Insider',
  title: {
    default: 'Festival Insider Hub',
    template: `%s | Festival Insider`,
  },
  description: 'Your tactical companion for global festivals.',
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: 'Festival Insider',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
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
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-6 focus:py-3 focus:bg-primary focus:text-white focus:rounded-full focus:font-black focus:uppercase focus:tracking-widest">
          Skip to content
        </a>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <MuiRegistry>
            <PwaLoader />
            <SwUpdateBanner />
            <InstallPrompt />
            <main id="main-content">
              {children}
            </main>
            <Toaster />
          </MuiRegistry>
        </ThemeProvider>
      </body>
    </html>
  );
}
