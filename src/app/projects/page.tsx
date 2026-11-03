import type { Metadata } from 'next';
import { projectsMetadata } from '../metadata';
import ProjectsClient from './projects-client';
import { projects } from '@/components/projects/projects-data';
import JsonLd from '@/components/seo/json-ld';
import { breadcrumbJsonLd } from '@/lib/breadcrumbs';
import { absoluteUrl, personId, siteConfig, websiteId } from '@/lib/site';

export const metadata: Metadata = projectsMetadata;

const projectsJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      '@id': `${absoluteUrl('/projects')}#page`,
      name: `Projects by ${siteConfig.author}`,
      url: absoluteUrl('/projects'),
      isPartOf: { '@id': websiteId },
      about: { '@id': personId },
      inLanguage: siteConfig.language,
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
              operatingSystem: 'Web',
              datePublished: String(project.year),
              author: { '@id': personId },
              ...(project.link ? { url: project.link } : {}),
              ...(project.github ? { codeRepository: project.github } : {}),
              keywords: project.stack.join(', '),
            },
          })),
      },
    },
    breadcrumbJsonLd([{ name: 'Projects', path: '/projects' }]),
  ],
};

export default function ProjectsPage() {
  return (
    <>
      <JsonLd data={projectsJsonLd} />
      <ProjectsClient />
    </>
  );
}
