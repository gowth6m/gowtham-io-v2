import HomeClient from './home-client';
import JsonLd from '@/components/seo/json-ld';
import { absoluteUrl, personId, siteConfig, websiteId } from '@/lib/site';

// Home inherits its metadata (title, canonical, Open Graph) from the root layout.

const homeJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': personId,
      name: siteConfig.author,
      alternateName: ['Gowtham', 'gowth6m'],
      url: siteConfig.url,
      image: absoluteUrl('/logo/logo.png'),
      jobTitle: siteConfig.jobTitle,
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
      sameAs: siteConfig.socials,
    },
    {
      '@type': 'WebSite',
      '@id': websiteId,
      url: siteConfig.url,
      name: siteConfig.name,
      description: siteConfig.description,
      inLanguage: siteConfig.language,
      publisher: { '@id': personId },
    },
    {
      '@type': 'ProfilePage',
      '@id': `${siteConfig.url}/#profilepage`,
      url: siteConfig.url,
      name: siteConfig.title,
      isPartOf: { '@id': websiteId },
      mainEntity: { '@id': personId },
      inLanguage: siteConfig.language,
    },
  ],
};

export default function Home() {
  return (
    <>
      <JsonLd data={homeJsonLd} />
      <HomeClient />
    </>
  );
}
