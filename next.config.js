import { withPayload } from '@payloadcms/next/withPayload'
import redirects from './redirects.js'

const NEXT_PUBLIC_SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  redirects,
  images: {
    domains: ['spaces.kendev.co', 'localhost'],
    loader: 'default',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'spaces.kendev.co',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'spaces.kendev.co',
        pathname: '/api/media/file/**',
      },
      {
        protocol: 'https',
        hostname: 'spaces.kendev.co',
        pathname: '/api/spaces-media/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/media/file/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/spaces-media/**',
      },
    ],
  },
  output: 'standalone',
  env: {
    NEXT_PUBLIC_SERVER_URL,
    PAYLOAD_PUBLIC_SERVER_URL: NEXT_PUBLIC_SERVER_URL,
  },
}

export default withPayload(nextConfig)
