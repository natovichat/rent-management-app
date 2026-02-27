import type { Metadata } from 'next';
import { Rubik } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import { AppShell } from '@/components/layout/AppShell';

const rubik = Rubik({ subsets: ['hebrew', 'latin'] });

export const metadata: Metadata = {
  title: 'מערכת ניהול נכסים',
  description: 'מערכת לניהול נכסים ושכירויות',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body className={rubik.className}>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
