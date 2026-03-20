import type { Metadata } from 'next';
import { projectsMetadata } from '../metadata';
import ProjectsClient from './projects-client';

export const metadata: Metadata = projectsMetadata;

const itemListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Projects by Gowthaman Ravindrathas',
  url: 'https://gowtham.io/projects',
  about: {
    '@type': 'Person',
    name: 'Gowthaman Ravindrathas',
  },
};

export default function ProjectsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <ProjectsClient />
    </>
  );
}
