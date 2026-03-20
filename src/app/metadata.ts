import { Metadata, Viewport } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_METADATA_BASE || 'https://gowtham.io';
const metadataBase = new URL(baseUrl);
const defaultImage = '/logo/logo.png';

export const mainMetadata: Metadata = {
  title: 'Gowthaman Ravindrathas - Software Engineer based in London, UK',
  description: 'Portfolio of Gowthaman Ravindrathas - Software Engineer based in London, UK',
  applicationName: "Gowtham's Portfolio",
  keywords: [
    'Gowthaman Ravindrathas',
    'Software Engineer London',
    'Frontend Developer',
    'Backend Developer',
    'Fullstack Developer',
    'Web Development Portfolio',
    'React Developer',
    'Node.js Developer',
    'Gowtham Portfolio',
    'gowth6m',
    'Wavelink',
    'Gowthaman',
    'Ravindrathas',
    'Gowtham',
  ],
  creator: 'Gowthaman Ravindrathas',
  publisher: 'Gowthaman Ravindrathas',
  openGraph: {
    title: 'Gowthaman Ravindrathas - Software Engineer Portfolio',
    description: 'Portfolio of Gowthaman Ravindrathas - Software Engineer based in London, UK',
    type: 'website',
    locale: 'en_GB',
    siteName: "Gowtham's Portfolio",
    images: [
      {
        url: defaultImage,
        width: 1200,
        height: 630,
        alt: 'Gowtham Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@gowth6m',
    creator: '@gowth6m',
    title: 'Gowthaman Ravindrathas - Software Engineer based in London, UK',
    description: 'Portfolio of Gowthaman Ravindrathas - Software Engineer based in London, UK',
    images: [defaultImage],
  },
  icons: {
    icon: [
      { url: '/logo/logo.svg', type: 'image/svg+xml' },
      { url: '/logo/logo.png', sizes: '180x180' },
    ],
    apple: '/logo/logo.png',
  },
  category: 'portfolio',
  robots: 'index, follow',
  metadataBase,
};

export const homeMetadata: Metadata = {
  title: 'Gowthaman Ravindrathas - Software Engineer based in London, UK',
  description: 'Portfolio of Gowthaman Ravindrathas - Software Engineer based in London, UK',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Gowthaman Ravindrathas - Software Engineer Portfolio',
    description: 'Portfolio of Gowthaman Ravindrathas - Software Engineer based in London, UK',
    url: '/',
    type: 'website',
    locale: 'en_GB',
    siteName: "Gowtham's Portfolio",
    images: [
      {
        url: defaultImage,
        width: 1200,
        height: 630,
        alt: 'Gowtham Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@gowth6m',
    creator: '@gowth6m',
    title: 'Gowthaman Ravindrathas - Software Engineer based in London, UK',
    description: 'Portfolio of Gowthaman Ravindrathas - Software Engineer based in London, UK',
    images: [defaultImage],
  },
};

export const viewport: Viewport = {
  themeColor: '#0a192f',
  width: 'device-width',
  initialScale: 1,
};

export const projectsMetadata: Metadata = {
  title: 'Projects - Gowthaman Ravindrathas',
  description:
    'A collection of software projects by Gowthaman Ravindrathas across AI, frontend, backend, and full-stack engineering.',
  keywords: [
    'Gowtham projects',
    'software portfolio projects',
    'full-stack projects',
    'AI projects',
  ],
  alternates: {
    canonical: '/projects',
  },
  openGraph: {
    title: 'Projects - Gowthaman Ravindrathas',
    description:
      'Explore software projects built by Gowthaman Ravindrathas, including AI products, web platforms, and engineering experiments.',
    url: '/projects',
    type: 'website',
    locale: 'en_GB',
    siteName: "Gowtham's Portfolio",
    images: [
      {
        url: defaultImage,
        width: 1200,
        height: 630,
        alt: 'Gowtham Portfolio Projects',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@gowth6m',
    creator: '@gowth6m',
    title: 'Projects - Gowthaman Ravindrathas',
    description:
      'Explore software projects built by Gowthaman Ravindrathas, including AI products, web platforms, and engineering experiments.',
    images: [defaultImage],
  },
};

export const experienceMetadata: Metadata = {
  title: 'Experience - Gowthaman Ravindrathas',
  description:
    'Professional experience of Gowthaman Ravindrathas, a software engineer building scalable products across frontend and backend systems.',
  keywords: ['Gowtham experience', 'software engineer experience', 'career timeline'],
  alternates: {
    canonical: '/experience',
  },
  openGraph: {
    title: 'Experience - Gowthaman Ravindrathas',
    description:
      'Professional timeline and roles of Gowthaman Ravindrathas across startups and established teams.',
    url: '/experience',
    type: 'website',
    locale: 'en_GB',
    siteName: "Gowtham's Portfolio",
    images: [
      {
        url: defaultImage,
        width: 1200,
        height: 630,
        alt: 'Gowtham Portfolio Experience',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@gowth6m',
    creator: '@gowth6m',
    title: 'Experience - Gowthaman Ravindrathas',
    description:
      'Professional timeline and roles of Gowthaman Ravindrathas across startups and established teams.',
    images: [defaultImage],
  },
};
