import '../styles/typingText.css';
import '../styles/globals.css';
import '../styles/side.css';
import '../styles/nav.css';
import '../styles/retro.css';
import type { Metadata, Viewport } from 'next';
import { mainMetadata, viewport as siteViewport } from './metadata';
import { Inter, Comfortaa, MuseoModerno, VT323 } from 'next/font/google';
import BackgroundAnimation from '@/components/misc/background-animation';
import EasterEggs from '@/components/easter-eggs/easter-eggs';

// ------------------------------------------------------------

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const comfortaa = Comfortaa({
  subsets: ['latin'],
  variable: '--font-comfortaa',
});
const museoModerno = MuseoModerno({
  subsets: ['latin'],
  variable: '--font-museo-moderno',
});

const vt323 = VT323({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-vt323',
  preload: false,
});

// ------------------------------------------------------------

export const metadata: Metadata = mainMetadata;
export const viewport: Viewport = siteViewport;

// ------------------------------------------------------------

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-GB"
      className={`${inter.variable} ${comfortaa.variable} ${museoModerno.variable} ${vt323.variable}`}
    >
      <body>
        <BackgroundAnimation color={'white'} />
        {/* <BackgroundHover /> */}
        {children}
        <EasterEggs />
      </body>
    </html>
  );
}
