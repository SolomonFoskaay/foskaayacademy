/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["localhost", "foskaayacademy.com", "dprogramminguniversity.com", "exploreweb3.xyz", "res.cloudinary.com", "i9.ytimg.com", "img.youtube.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: "",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/X',
        destination: 'https://x.com/SolomonFoskaay',
        permanent: true,
      },
    ]
  },
  // Add static file serving configuration
  async headers() {
    return [
      {
        source: '/course-videos/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self' https://www.youtube.com https://*.youtube.com https://ajax.googleapis.com; connect-src 'self' https://www.youtube.com https://*.youtube.com https://ajax.googleapis.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://*.youtube.com https://ajax.googleapis.com; style-src 'self' 'unsafe-inline'; img-src 'self' https://img.youtube.com https://*.ytimg.com data:; frame-src https://www.youtube.com https://*.youtube.com; media-src 'self' https://www.youtube.com https://*.youtube.com;"
          }
        ],
      }
    ]
  }
};

module.exports = nextConfig;
