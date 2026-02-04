import Navbar from '@/components/layout/landing/Navbar';
import Footer from '@/components/layout/landing/Footer';

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
