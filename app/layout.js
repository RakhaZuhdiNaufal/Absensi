import './globals.css';

export const metadata = {
  title: 'Absensi Siswa PKL - Sistem Kehadiran Praktik Kerja Lapangan',
  description: 'Aplikasi Web Absensi Siswa PKL berbasis kamera dan lokasi terverifikasi realtime.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <meta httpEquiv="Content-Security-Policy" content="default-src * 'unsafe-inline' 'unsafe-eval' data: blob: http: https:; script-src * 'unsafe-inline' 'unsafe-eval' http: https: blob:; style-src * 'unsafe-inline' http: https:; img-src * data: blob: http: https:;" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#f9f8f3] text-[#57564F] min-h-screen antialiased selection:bg-[#57564F] selection:text-[#F8F3CE]">
        <div className="min-h-screen flex flex-col justify-between">
          {children}
        </div>
      </body>
    </html>
  );
}
