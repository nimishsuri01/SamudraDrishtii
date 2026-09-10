import type { Metadata } from 'next';
import Script from 'next/script';
import '../index.css';

export const metadata: Metadata = {
  title: 'SamudraDrishti | 3D Ocean Digital Twin & Maritime Observation Platform',
  description: 'Interactive 3D ocean intelligence, numerical model visualization, and in-situ observational platform for the North Indian Ocean.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* Modern Typography: Plus Jakarta Sans */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap"
          rel="stylesheet"
        />
        {/* CesiumJS Library & Stylesheet */}
        <link
          rel="stylesheet"
          href="https://cesium.com/downloads/cesiumjs/releases/1.120/Build/Cesium/Widgets/widgets.css"
        />
        <Script
          src="https://cesium.com/downloads/cesiumjs/releases/1.120/Build/Cesium/Cesium.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="bg-[#f8fafc] text-slate-900 min-h-screen overflow-x-hidden antialiased">
        {children}
      </body>
    </html>
  );
}
