import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { AppShell } from '@/components/layout/AppShell';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SSP Repo Command Center | Vehicle Recovery Dashboard',
  description:
    'Modern vehicle repossession and yard management dashboard for tracking vehicles, repo cases, status updates, and operational alerts.',
  icons: {
    icon: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-100/60">
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
