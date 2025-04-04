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
            value: "script-src 'self' 'unsafe-inline' 'unsafe-eval' [https://www.youtube.com](https://www.youtube.com) [https://ajax.googleapis.com](https://ajax.googleapis.com);"
          }
        ],
      }
    ]
  }
};

module.exports = nextConfig;
