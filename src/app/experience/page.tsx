import type { Metadata } from 'next';
import { experienceMetadata } from '../metadata';
import ExperienceClient from './experience-client';
import { experience } from '@/components/experience/experience-data';
import JsonLd from '@/components/seo/json-ld';
import { breadcrumbJsonLd } from '@/lib/breadcrumbs';
import { absoluteUrl, personId, siteConfig, websiteId } from '@/lib/site';

export const metadata: Metadata = experienceMetadata;

/** "Jan 2024" -> "2024-01"; returns undefined for "Present" or unparseable values. */
const toIsoMonth = (value: string) => {
  const date = new Date(`1 ${value.trim()} UTC`);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 7);
};

const roles = experience.map((role) => {
  const [start, end] = role.dates.split(' - ');
  return {
    '@type': 'EmployeeRole',
    roleName: role.role,
    description: role.description,
    startDate: toIsoMonth(start ?? ''),
    ...(end && toIsoMonth(end) ? { endDate: toIsoMonth(end) } : {}),
    worksFor: {
      '@type': 'Organization',
      name: role.company,
      ...(role.link ? { url: role.link } : {}),
    },
    skills: role.technologies.join(', '),
  };
});

const experienceJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ProfilePage',
      '@id': `${absoluteUrl('/experience')}#page`,
      name: `Experience - ${siteConfig.author}`,
      url: absoluteUrl('/experience'),
      isPartOf: { '@id': websiteId },
      inLanguage: siteConfig.language,
      mainEntity: {
        '@type': 'Person',
        '@id': personId,
        name: siteConfig.author,
        url: siteConfig.url,
        jobTitle: siteConfig.jobTitle,
        worksFor: roles,
      },
    },
    breadcrumbJsonLd([{ name: 'Experience', path: '/experience' }]),
  ],
};

export default function ExperiencePage() {
  return (
    <>
      <JsonLd data={experienceJsonLd} />
      <ExperienceClient />
    </>
  );
}
