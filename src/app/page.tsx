import type { Metadata } from 'next';
import HomeClient from './home-client';
import { homeMetadata } from './metadata';

export const metadata: Metadata = homeMetadata;

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Gowthaman Ravindrathas',
  url: 'https://gowtham.io',
  jobTitle: 'Software Engineer',
  sameAs: [
    'https://github.com/gowth6m',
    'https://www.linkedin.com/in/gowth6m/',
    'https://x.com/gowth6m',
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <HomeClient />
    </>
  );
}
