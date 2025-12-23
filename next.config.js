/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
  // PWA optimization for iOS
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-UA-Compatible',
          value: 'IE=edge',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
      ],
    },
  ],
}

module.exports = nextConfig
