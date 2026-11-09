import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wifitics - NOC Commander v4.2 | Real-Time Network Monitoring',
  description: 'Enterprise office network monitoring dashboard: Aruba switches, PCs, printers, 2D/3D topology',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-surface-canvas text-on-surface antialiased">
        {children}
      </body>
    </html>
  );
}

