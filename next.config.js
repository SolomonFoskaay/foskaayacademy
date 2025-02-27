/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["localhost", "jupfaqanswered.xyz", "exploreweb3.xyz", "res.cloudinary.com", "i9.ytimg.com", "img.youtube.com"],
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
        destination: 'https://x.com/JupFAQAnswered',
        permanent: true,
      },      
    ]
  },
};

module.exports = nextConfig;
