/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Configuration pour les Server Components et Supabase
    serverComponentsExternalPackages: ['@supabase/supabase-js', '@supabase/ssr']
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      }
    ],
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
  // Configuration pour la production
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // Configuration des en-têtes de sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ]
  },

  // Configuration des redirections si nécessaire
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/',
        permanent: false,
      },
    ]
  },

  // Configuration pour optimiser les builds
  swcMinify: true,
  
  // Configuration TypeScript stricte
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Configuration ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig