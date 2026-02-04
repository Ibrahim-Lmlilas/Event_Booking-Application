import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '@/app/globals.css';
import Navbar from '@/components/layout/landing/Navbar';
import { Toaster } from '@/components/ui/sonner';
import Footer from '@/components/layout/landing/Footer';
import { AuthProvider } from '@/lib/context/AuthContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Eventzi - Connect. Inspire. Transform.',
  description: 'Join visionaries, creators, and innovators for unforgettable events',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
          <Navbar />
          {children}
          <Footer />
          <Toaster position="bottom-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
