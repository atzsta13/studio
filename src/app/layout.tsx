import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import PwaLoader from '@/components/pwa-loader';
import Header from '@/components/layout/header';
import BottomNav from '@/components/layout/bottom-nav';

const APP_NAME = "Sziget Insider 2026";
const APP_DEFAULT_TITLE = "Sziget Insider 2026";
const APP_DESCRIPTION = "Your unofficial offline-first guide to Sziget Festival 2026.";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: "%s | Sziget 2026",
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#222051",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Varela+Round&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <PwaLoader />
        <div className="relative flex min-h-screen w-full flex-col">
          <Header />
          <main className="flex-1 pb-20 md:pb-0">{children}</main>
          <BottomNav />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
