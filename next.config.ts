
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
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
        protocol: 'https' as const,
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            // Allow scripts from self, google apis, gstatic, and unsafe-inline/eval for dev.
            value: "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.googletagmanager.com *.googleapis.com *.gstatic.com;".replace(/\s{2,}/g, ' ').trim()
          },
        ],
      },
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb', // Increase for audio uploads
      serverActionsTimeout: 120000, // 2 minutes timeout for Genkit flows
    },
  },
};

export default nextConfig;
