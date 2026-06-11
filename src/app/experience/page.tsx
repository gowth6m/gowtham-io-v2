import type { Metadata } from 'next';
import { experienceMetadata } from '../metadata';
import ExperienceClient from './experience-client';
import { experience } from '@/components/experience/experience-data';

export const metadata: Metadata = experienceMetadata;

const baseUrl = 'https://gowtham.io';

const experienceJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  name: 'Experience - Gowthaman Ravindrathas',
  url: `${baseUrl}/experience`,
  mainEntity: {
    '@type': 'Person',
    name: 'Gowthaman Ravindrathas',
    url: baseUrl,
    jobTitle: 'Software Engineer',
    hasOccupation: experience.map((role) => ({
      '@type': 'Occupation',
      name: role.role,
      description: role.description,
      occupationLocation: {
        '@type': 'Organization',
        name: role.company,
        url: role.link,
      },
      skills: role.technologies.join(', '),
    })),
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
