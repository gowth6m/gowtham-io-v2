import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { siteConfig } from './site';

export const ogSize = { width: 1200, height: 630 };

/**
 * Social share images, rendered at build time by `app/og/[image]/route.tsx`
 * to `/og/<key>.png`. They are emitted with a real `.png` extension (instead of
 * the extensionless `opengraph-image` convention) so static hosts such as
 * GitHub Pages serve them with an `image/png` content type.
 */
export const ogImages = {
  home: {
    title: 'Gowthaman Ravindrathas',
    subtitle:
      'Full-stack software engineer and Co-Founder & CTO of Wavelink, building AI-powered products.',
    alt: 'Gowthaman Ravindrathas - Software Engineer based in London, UK',
  },
  projects: {
    title: 'Projects',
    subtitle: 'AI products, web platforms and engineering experiments built end-to-end.',
    alt: 'Projects by Gowthaman Ravindrathas',
  },
  experience: {
    title: 'Experience',
    subtitle: 'Roles across startups, scale-ups and established teams, from frontend to cloud.',
    alt: 'Professional experience of Gowthaman Ravindrathas',
  },
} as const;

export type OgImageKey = keyof typeof ogImages;

/** Metadata `images` entry for a generated share image. */
export const ogImage = (key: OgImageKey) => ({
  url: `/og/${key}.png`,
  ...ogSize,
  alt: ogImages[key].alt,
  type: 'image/png',
});

export async function renderOgImage({ title, subtitle }: { title: string; subtitle: string }) {
  const logo = await readFile(join(process.cwd(), 'public/logo/logo.png'), 'base64');
  const host = new URL(siteConfig.url).host;

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px 80px',
        background: 'linear-gradient(135deg, #0a192f 0%, #112240 100%)',
        color: '#ccd6f6',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`data:image/png;base64,${logo}`} width={88} height={88} alt="" />
        <div style={{ display: 'flex', fontSize: 30, color: '#64ffda' }}>{host}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', fontSize: 72, fontWeight: 700, color: '#e6f1ff' }}>
          {title}
        </div>
        <div style={{ display: 'flex', fontSize: 34, color: '#8892b0', lineHeight: 1.4 }}>
          {subtitle}
        </div>
      </div>
      <div style={{ display: 'flex', fontSize: 28, color: '#8892b0' }}>
        {`${siteConfig.author} · ${siteConfig.jobTitle} · London, UK`}
      </div>
    </div>,
    ogSize
  );
}
