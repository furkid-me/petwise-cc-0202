/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'profile.line-scdn.net', // LINE profile images
      'obs.line-scdn.net',     // LINE images
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOW-FROM https://liff.line.me',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
