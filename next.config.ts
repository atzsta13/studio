import type { NextConfig } from 'next';

// basePath tracks the GitHub Pages project name, NOT the product name.
// The repo is still `studio`, so this stays `/studio` until either the repo is
// renamed to `openfestivalhub` or a custom domain (openfestivalhub.org) is wired up.
// Changing it before then breaks every asset and data fetch on the live site.
// When it does change, also update `productionUrl` in every festivals/<id>/config.json
// and bump the cache names in public/sw.js — existing PWA installs will have a stale scope.
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: '/studio',
  env: {
    NEXT_PUBLIC_BASE_PATH: '/studio',
  },
  experimental: {
    optimizePackageImports: [
      '@mui/material',
      '@mui/icons-material',
      'lucide-react',
      'react-icons',
    ],
  },
  // Transpile for SSR/hydration compatibility with Emotion and MUI
  transpilePackages: [
    '@mui/material',
    '@mui/system',
    '@mui/icons-material',
    '@mui/material-nextjs',
    '@emotion/react',
    '@emotion/styled',
    '@emotion/cache',
    'lucide-react',
  ],
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'media.appmiral.com', pathname: '/**' },
      { protocol: 'https', hostname: 'is1-ssl.mzstatic.com', pathname: '/**' },
      { protocol: 'https', hostname: '*.mzstatic.com', pathname: '/**' },
      { protocol: 'https', hostname: 'coverartarchive.org', pathname: '/**' },
    ],
  },
};

export default nextConfig;
