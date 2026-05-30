import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: '/studio',
  env: {
    NEXT_PUBLIC_BASE_PATH: '/studio',
  },
  // Aggressively transpile packages to prevent module factory/call errors in Next.js 15/16
  transpilePackages: [
    '@mui/material',
    '@mui/system',
    '@mui/icons-material',
    '@mui/material-nextjs',
    '@emotion/react',
    '@emotion/styled',
    '@emotion/cache',
    'lucide-react'
  ],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.appmiral.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
