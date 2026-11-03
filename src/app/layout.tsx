import '../styles/typingText.css';
import '../styles/globals.css';
import '../styles/side.css';
import '../styles/nav.css';
import '../styles/pixel-avatar.css';
import type { Metadata, Viewport } from 'next';
import { mainMetadata, viewport as siteViewport } from './metadata';
import { Inter, Comfortaa, MuseoModerno } from 'next/font/google';
import BackgroundAnimation from '@/components/misc/background-animation';

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

// ------------------------------------------------------------

export const metadata: Metadata = mainMetadata;
export const viewport: Viewport = siteViewport;

// ------------------------------------------------------------

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-GB"
      className={`${inter.variable} ${comfortaa.variable} ${museoModerno.variable}`}
    >
      <body>
        <BackgroundAnimation color={'white'} />
        {/* <BackgroundHover /> */}
        {children}
      </body>
    </html>
  );
}
