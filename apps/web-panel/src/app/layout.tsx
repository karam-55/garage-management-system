import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Garage Management System',
  description: 'Garage Management System - Web Panel',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
