import { withPayload } from '@payloadcms/next/withPayload'

import redirects from './redirects.js'

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/media/**',
      },
    ],
  },
  reactStrictMode: true,
  redirects,
  experimental: {
    // ... existing experimental config
  },
  unstable_excludeFiles: ['**/recover-password/**'],
  generateStaticParams: async () => {
    return {
      dynamicParams: true, // Allow dynamic routes
      excludePages: ['/recover-password'], // Exclude recover-password from static generation
    }
  },
}

export default withPayload(nextConfig)
