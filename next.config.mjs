/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:",
              "script-src * 'unsafe-inline' 'unsafe-eval' wss://public-api.birdeye.so/socket/solana ws://public-api.birdeye.so/socket/solana",
              "connect-src * 'unsafe-inline'",
              "img-src * data: blob: 'unsafe-inline'",
              "style-src * 'unsafe-inline'",
              "frame-ancestors *",
              "frame-src 'self' https://auth.privy.io https://oauth.telegram.org blob:"
            ].join('; ')
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: '*'
          }
        ]
      }
    ];
  }
};

export default nextConfig;
