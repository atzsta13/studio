import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  // Explicitly transpile MUI packages to resolve runtime 'call' of undefined errors in Next.js 15
  transpilePackages: ['@mui/material', '@mui/system', '@mui/icons-material', '@mui/material-nextjs'],
  images: {
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
