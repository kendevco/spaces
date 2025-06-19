import { withPayload } from '@payloadcms/next/withPayload'
import redirects from './redirects.mjs'

const NEXT_PUBLIC_SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : `http://localhost:${process.env.PORT || 3000}`)

const LOCALHOST_PORT = process.env.PORT || '3000'

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
        pathname: '/api/spaces-media/file/**',
      },
      {
        protocol: 'https',
        hostname: 'spaces.kendev.co',
        pathname: '/spaces-media/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: LOCALHOST_PORT,
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: LOCALHOST_PORT,
        pathname: '/api/media/file/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: LOCALHOST_PORT,
        pathname: '/api/spaces-media/file/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: LOCALHOST_PORT,
        pathname: '/spaces-media/**',
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
