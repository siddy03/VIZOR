// Framework CSS — order matters (theme first, custom overrides last via globals.css)
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import './globals.css';

import { Arimo } from 'next/font/google';
import { Providers } from './providers';

// Arimo is metric-compatible with Arial / Arial Nova (the app's intended typeface,
// whose font files were never shipped). Loading it via next/font gives a crisp,
// consistent, self-hosted webfont across every OS while preserving the original look.
const arimo = Arimo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata = {
  title: 'VIZOR',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={arimo.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
