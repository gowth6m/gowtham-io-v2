import { ogImages, renderOgImage, type OgImageKey } from '@/lib/og-image';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(ogImages).map((key) => ({ image: `${key}.png` }));
}

export async function GET(_request: Request, ctx: { params: Promise<{ image: string }> }) {
  const { image } = await ctx.params;
  const key = image.replace(/\.png$/, '') as OgImageKey;
  return renderOgImage(ogImages[key]);
}
