import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Advanced Panorama Viewer',
  description: 'Interactive 3D panorama tour with floor navigation',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:," />
      </head>
      <body>{children}</body>
    </html>
  );
}
