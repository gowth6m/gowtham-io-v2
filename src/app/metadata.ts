import type { Metadata, Viewport } from 'next';
import { ogImage, type OgImageKey } from '@/lib/og-image';
import { siteConfig } from '@/lib/site';

const sharedOpenGraph = {
  type: 'website',
  locale: siteConfig.locale,
  siteName: siteConfig.name,
} satisfies Metadata['openGraph'];

const sharedTwitter = {
  card: 'summary_large_image',
  site: siteConfig.twitterHandle,
  creator: siteConfig.twitterHandle,
} satisfies Metadata['twitter'];

export const mainMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.author}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    'Gowthaman Ravindrathas',
    'Gowtham',
    'gowth6m',
    'Software Engineer London',
    'Full-Stack Developer',
    'Frontend Developer',
    'Backend Developer',
    'React Developer',
    'Next.js Developer',
    'Node.js Developer',
    'AI Engineer',
    'Wavelink',
  ],
  creator: siteConfig.author,
  publisher: siteConfig.author,
  authors: [{ name: siteConfig.author, url: siteConfig.url }],
  alternates: {
    canonical: '/',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    ...sharedOpenGraph,
    title: siteConfig.title,
    description: siteConfig.description,
    url: '/',
    images: [ogImage('home')],
  },
  twitter: {
    ...sharedTwitter,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [ogImage('home')],
  },
  icons: {
    icon: [
      { url: '/logo/logo.svg', type: 'image/svg+xml' },
      { url: '/logo/logo.png', type: 'image/png', sizes: '1024x1024' },
    ],
    apple: '/logo/logo.png',
  },
  category: 'technology',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

const pageMetadata = ({
  title,
  description,
  path,
  image,
}: {
  title: string;
  description: string;
  path: string;
  image: OgImageKey;
}): Metadata => ({
  title,
  description,
  alternates: { canonical: path },
  openGraph: {
    ...sharedOpenGraph,
    title: `${title} | ${siteConfig.author}`,
    description,
    url: path,
    images: [ogImage(image)],
  },
  twitter: {
    ...sharedTwitter,
    title: `${title} | ${siteConfig.author}`,
    description,
    images: [ogImage(image)],
  },
});

export const projectsMetadata: Metadata = pageMetadata({
  title: 'Projects',
  description:
    'Software projects by Gowthaman Ravindrathas, including AI products, web platforms, and engineering experiments across frontend, backend, and full-stack.',
  path: '/projects',
  image: 'projects',
});

export const experienceMetadata: Metadata = pageMetadata({
  title: 'Experience',
  description:
    'Professional experience of Gowthaman Ravindrathas, a software engineer building scalable products across startups, scale-ups, and established teams.',
  path: '/experience',
  image: 'experience',
});
