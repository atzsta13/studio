import type { NextConfig } from 'next';

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
