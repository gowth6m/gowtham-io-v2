/**
 * Single source of truth for site-wide SEO values (URLs, names, socials).
 * Used by the Metadata API, sitemap, robots, manifest, OG images and JSON-LD.
 */
export const siteConfig = {
  url: (process.env.NEXT_PUBLIC_METADATA_BASE || 'https://gowtham.io').replace(/\/$/, ''),
  name: "Gowtham's Portfolio",
  shortName: 'Gowtham',
  author: 'Gowthaman Ravindrathas',
  jobTitle: 'Software Engineer',
  title: 'Gowthaman Ravindrathas - Software Engineer based in London, UK',
  description:
    'Portfolio of Gowthaman Ravindrathas, a full-stack software engineer in London, UK and Co-Founder & CTO of Wavelink, building AI-powered products and polished web experiences.',
  locale: 'en_GB',
  language: 'en-GB',
  themeColor: '#0a192f',
  twitterHandle: '@gowth6m',
  socials: [
    'https://github.com/gowth6m',
    'https://www.linkedin.com/in/gowth6m/',
    'https://x.com/gowth6m',
    'https://www.instagram.com/gowth6m/',
    'https://codepen.io/Gowth6m',
  ],
} as const;

export const absoluteUrl = (path = '/') => new URL(path, `${siteConfig.url}/`).toString();

export const personId = `${siteConfig.url}/#person`;
export const websiteId = `${siteConfig.url}/#website`;
