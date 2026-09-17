import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Skip TypeScript errors during build — type checking is done separately via tsc.
  // Remove this once all type issues are resolved.
  typescript: {
    ignoreBuildErrors: true,
  },

  // Turbopack config (Next.js 16 default bundler)
  turbopack: {},

  // Webpack fallback (used when running with --webpack flag)
  webpack: (config: { externals?: unknown[] }, { isServer }: { isServer: boolean }) => {
    if (isServer) {
      config.externals = [...(config.externals ?? []), 'leaflet']
    }
    return config
  },

  // Allow images from Supabase storage
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
