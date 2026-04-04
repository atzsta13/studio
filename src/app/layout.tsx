import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import PwaLoader from '@/components/pwa-loader';
import MuiRegistry from '@/components/mui-registry';
import InstallPrompt from '@/components/install-prompt';
import { ThemeProvider } from '@/components/theme-provider';

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
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <MuiRegistry>
            <PwaLoader />
            <InstallPrompt />
            {children}
            <Toaster />
          </MuiRegistry>
        </ThemeProvider>
      </body>
    </html>
  );
}
