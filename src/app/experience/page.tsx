import type { Metadata } from 'next';
import { experienceMetadata } from '../metadata';
import ExperienceClient from './experience-client';

export const metadata: Metadata = experienceMetadata;

const experienceJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  name: 'Experience - Gowthaman Ravindrathas',
  url: 'https://gowtham.io/experience',
  mainEntity: {
    '@type': 'Person',
    name: 'Gowthaman Ravindrathas',
    jobTitle: 'Software Engineer',
  },
};

export default function ExperiencePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(experienceJsonLd) }}
      />
      <ExperienceClient />
    </>
  );
}
