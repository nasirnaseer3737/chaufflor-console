import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'Chaufflor-Style Demo — Luxury Chauffeur Booking',
  description:
    'Demo chauffeur booking website and admin console. Not affiliated with the real Chaufflor. No real payments, drivers or dispatch.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
