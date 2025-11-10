
import type {NextConfig} from 'next';
import withPWAInit from '@ducanh2912/next-pwa';

const isProduction = process.env.NODE_ENV === 'production';

const withPWA = withPWAInit({
  dest: 'public',
  disable: !isProduction,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
});

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // This is to allow cross-origin requests in development.
    // The dev environment uses a specific domain which Next.js flags.
    allowedDevOrigins: [
        'https://6000-firebase-studio-1759872437424.cluster-ikslh4rdsnbqsvu5nw3v4dqjj2.cloudworkstations.dev',
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
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
    ],
  },
};

export default isProduction ? withPWA(nextConfig) : nextConfig;
