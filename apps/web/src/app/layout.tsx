import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { DebugProvider } from '@/contexts/DebugContext';
import { DebugToggle } from '@/components/DebugToggle';

// Söhne (Klim Type Foundry) — body text
const sohne = localFont({
  src: [
    { path: '../../public/fonts/Sohne-Leicht.otf', weight: '300', style: 'normal' },
    { path: '../../public/fonts/Sohne-Buch.otf', weight: '400', style: 'normal' },
    { path: '../../public/fonts/Sohne-Halbfett.otf', weight: '600', style: 'normal' },
  ],
  variable: '--font-sohne',
  display: 'swap',
});

// Canela (Klim Type Foundry) — display / headers
const canela = localFont({
  src: [
    { path: '../../public/fonts/Canela-Light.otf', weight: '300', style: 'normal' },
    { path: '../../public/fonts/Canela-Regular.otf', weight: '400', style: 'normal' },
    { path: '../../public/fonts/Canela-Medium.otf', weight: '500', style: 'normal' },
  ],
  variable: '--font-canela',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'The Twelve',
  description: 'Taste intelligence platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${sohne.variable} ${canela.variable} ${jetbrains.variable} antialiased`}
      >
        <DebugProvider>
          <SessionProvider>
            {children}
            {/* <DebugToggle /> */}
          </SessionProvider>
        </DebugProvider>
      </body>
    </html>
  );
}
