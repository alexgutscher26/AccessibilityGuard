import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ClientRoot from './client';
import { Footer } from '@/components/footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AccessibilityGuard - Web Accessibility Testing Tool',
  description: 'Comprehensive web accessibility testing and reporting tool based on WCAG guidelines',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ClientRoot>
          <main className="flex-1 bg-background">
            {children}
          </main>
          <Footer />
        </ClientRoot>
      </body>
    </html>
  );
}