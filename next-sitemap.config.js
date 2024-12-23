// /next-sitemap.config.js

/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.NEXT_PUBLIC_BASE_URL,
    generateRobotsTxt: true,
    sitemapSize: 500,
    generateIndexSitemap: true,
    exclude: [
      '/dashboard/*', // Add dashboard exclusion
      '/donor/*'  // Add donor exclusion
    ],
    robotsTxtOptions: {
      policies: [
        {
          userAgent: '*',
          allow: '/',
          disallow: [
            '/dashboard', // Add dashboard base path
            '/dashboard/*', // Add all dashboard subpaths
            '/donor',  // Add donor base path
            '/donor/*' // Add all donor subpaths
          ],
        },
      ],
      additionalSitemaps: [
        `${process.env.NEXT_PUBLIC_BASE_URL}/sitemap/index.xml`,
        `${process.env.NEXT_PUBLIC_BASE_URL}/sitemap/projects-listings.xml`,
        `${process.env.NEXT_PUBLIC_BASE_URL}/sitemap/crypto-ath-price-prediction-list.xml`,
        `${process.env.NEXT_PUBLIC_BASE_URL}/sitemap/categories.xml`,
        `${process.env.NEXT_PUBLIC_BASE_URL}/sitemap/blinks-listings.xml`,
      ],
    },
    transform: async (config, path) => {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 0.7,
        lastmod: new Date().toISOString(),
      };
    },
  };
  

  