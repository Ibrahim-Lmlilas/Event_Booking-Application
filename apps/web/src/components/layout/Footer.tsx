import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t-2 border-white">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logoeventzii.png"
              alt="Eventzi logo"
              width={120}
              height={40}
              className="h-10 w-auto object-contain"
            />
          </Link>

          {/* Links - same as Navbar */}
          <nav className="flex flex-wrap items-center justify-center gap-6 md:gap-16">
            <Link
              href="/"
              className="text-white hover:text-gray-300 font-bold transition-colors"
            >
              Home
            </Link>
            <Link
              href="/events"
              className="text-white hover:text-gray-300 font-bold transition-colors"
            >
              Event details
            </Link>
            <Link
              href="#speakers"
              className="text-white hover:text-gray-300 font-bold transition-colors"
            >
              Speakers
            </Link>
            <Link
              href="#pricing"
              className="text-white hover:text-gray-300 font-bold transition-colors"
            >
              Pricing
            </Link>
          </nav>

         
        </div>

        <div className="mt-8 pt-6 border-t border-gray-700 text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} Eventzi. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
