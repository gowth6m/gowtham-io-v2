import type { Metadata } from 'next';
import HomeClient from './home-client';
import { homeMetadata } from './metadata';

export const metadata: Metadata = homeMetadata;

const baseUrl = 'https://gowtham.io';

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${baseUrl}/#person`,
  name: 'Gowthaman Ravindrathas',
  alternateName: ['Gowtham', 'gowth6m'],
  url: baseUrl,
  image: `${baseUrl}/logo/logo.png`,
  jobTitle: 'Software Engineer',
  description:
    'Gowthaman Ravindrathas is a full-stack software engineer based in London, UK, and Co-Founder & CTO of Wavelink. He builds AI-powered products and polished web experiences across frontend and backend systems.',
  worksFor: {
    '@type': 'Organization',
    name: 'Wavelink',
    url: 'https://wavelink.co',
  },
  alumniOf: {
    '@type': 'CollegeOrUniversity',
    name: 'University of Exeter',
    url: 'https://www.exeter.ac.uk/',
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'London',
    addressCountry: 'GB',
  },
  knowsAbout: [
    'Software Engineering',
    'Full-Stack Development',
    'Frontend Development',
    'Backend Development',
    'Artificial Intelligence',
    'Large Language Models',
    'React',
    'Next.js',
    'TypeScript',
    'Node.js',
    'NestJS',
    'Python',
    'AWS',
    'Cloud Architecture',
  ],
  sameAs: [
    'https://github.com/gowth6m',
    'https://www.linkedin.com/in/gowth6m/',
    'https://x.com/gowth6m',
    'https://www.instagram.com/gowth6m/',
    'https://codepen.io/Gowth6m',
  ],
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${baseUrl}/#website`,
  url: baseUrl,
  name: "Gowtham's Portfolio",
  description: 'Portfolio of Gowthaman Ravindrathas - Software Engineer based in London, UK.',
  inLanguage: 'en-GB',
  publisher: { '@id': `${baseUrl}/#person` },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <HomeClient />
    </>
  );
}
