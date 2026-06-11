import type { Metadata } from 'next';
import { projectsMetadata } from '../metadata';
import ProjectsClient from './projects-client';
import { projects } from '@/components/projects/projects-data';

export const metadata: Metadata = projectsMetadata;

const baseUrl = 'https://gowtham.io';

const itemListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Projects by Gowthaman Ravindrathas',
  url: `${baseUrl}/projects`,
  about: {
    '@type': 'Person',
    name: 'Gowthaman Ravindrathas',
    url: baseUrl,
  },
  mainEntity: {
    '@type': 'ItemList',
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
    numberOfItems: projects.length,
    itemListElement: [...projects]
      .sort((a, b) => b.year - a.year)
      .map((project, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'SoftwareApplication',
          name: project.title,
          description: project.description,
          applicationCategory: 'WebApplication',
          datePublished: String(project.year),
          author: { '@type': 'Person', name: 'Gowthaman Ravindrathas' },
          ...(project.link ? { url: project.link } : {}),
          ...(project.github ? { codeRepository: project.github } : {}),
          keywords: project.stack.join(', '),
        },
      })),
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
