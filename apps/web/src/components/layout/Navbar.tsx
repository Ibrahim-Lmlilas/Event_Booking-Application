'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { LogIn, UserPlus, X } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      id="navbar"
      className={`fixed z-20 transition-all duration-300 ${
        isScrolled
          ? 'bg-gray-900/75 backdrop-blur-md mt-4 left-6 right-6 rounded-2xl shadow-lg'
          : 'bg-gray-300 backdrop-blur-sm w-full'
      }`}
    >
      <div className={`mx-auto px-6 py-5 transition-all duration-300 ${
        isScrolled ? 'container' : 'container'
      }`}>
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <div className="flex items-center h-full -my-5">
            <Link href="/" className="h-full flex items-center">
              <Image
                src="/logoeventzi.png"
                alt="eventzi logo"
                width={120}
                height={60}
                className="h-full w-auto object-contain"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-16">
            <Link
              href="/"
              className={`group relative transition-colors font-bold ${
                isScrolled
                  ? 'text-white hover:text-gray-300'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Home
              <span
                className={`absolute left-0 bottom-0 h-0.5 w-0 transition-all duration-300 ease-in-out ${
                  isScrolled ? 'bg-white' : 'bg-gray-900'
                } group-hover:w-full`}
              />
            </Link>
            <Link
              href="/events"
              className={`group relative transition-colors font-bold ${
                isScrolled
                  ? 'text-white hover:text-gray-300'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Event details
              <span
                className={`absolute left-0 bottom-0 h-0.5 w-0 transition-all duration-300 ease-in-out ${
                  isScrolled ? 'bg-white' : 'bg-gray-900'
                } group-hover:w-full`}
              />
            </Link>
            <Link
              href="#speakers"
              className={`group relative transition-colors font-bold ${
                isScrolled
                  ? 'text-white hover:text-gray-300'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Speakers
              <span
                className={`absolute left-0 bottom-0 h-0.5 w-0 transition-all duration-300 ease-in-out ${
                  isScrolled ? 'bg-white' : 'bg-gray-900'
                } group-hover:w-full`}
              />
            </Link>
            <Link
              href="#pricing"
              className={`group relative transition-colors font-bold ${
                isScrolled
                  ? 'text-white hover:text-gray-300'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Pricing
              <span
                className={`absolute left-0 bottom-0 h-0.5 w-0 transition-all duration-300 ease-in-out ${
                  isScrolled ? 'bg-white' : 'bg-gray-900'
                } group-hover:w-full`}
              />
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Button
              asChild
              variant="outline"
              className={`rounded-lg transition-all font-bold ${
                isScrolled
                  ? 'border-gray-600 bg-gray-800 hover:bg-gray-700 text-white'
                  : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-900'
              }`}
            >
              <Link href="/login" className="flex items-center">
                <LogIn className="h-5 w-5 mr-2" />
                Login
              </Link>
            </Button>
            <Button
              asChild
              className={`rounded-lg transition-all font-bold ${
                isScrolled
                  ? 'bg-gray-800 hover:bg-gray-700 text-white'
                  : 'bg-gray-900 hover:bg-gray-800 text-white'
              }`}
            >
              <Link href="/register" className="flex items-center">
                <UserPlus className="h-5 w-5 mr-2" />
                Register
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              className={`focus:outline-none transition-colors duration-300 ${
                isScrolled
                  ? 'text-white hover:text-gray-300'
                  : 'text-gray-900 hover:text-gray-700'
              }`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>

            {/* Mobile Menu */}
            <div
              className={`mobile-menu fixed top-0 left-0 right-0 bg-gray-800/95 backdrop-blur-md py-5 shadow-lg z-50 border-t border-gray-700 rounded-2xl transition-all duration-300 ease-in-out ${
                mobileMenuOpen 
                  ? 'opacity-100 visible translate-y-0' 
                  : 'opacity-0 invisible -translate-y-4 pointer-events-none'
              }`}
              id="mobile-menu"
            >
              <div className="container mx-auto px-6">
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-white hover:text-gray-300 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="flex flex-col space-y-4">
                  <Link
                    href="/"
                    className="text-white hover:text-gray-300 flex items-center py-3 px-4 rounded-lg hover:bg-gray-800 transition-all duration-300 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    href="/events"
                    className="text-white hover:text-gray-300 flex items-center py-3 px-4 rounded-lg hover:bg-gray-800 transition-all duration-300 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Event details
                  </Link>
                  <Link
                    href="#speakers"
                    className="text-white hover:text-gray-300 flex items-center py-3 px-4 rounded-lg hover:bg-gray-800 transition-all duration-300 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Speakers
                  </Link>
                  <Link
                    href="#pricing"
                    className="text-white hover:text-gray-300 flex items-center py-3 px-4 rounded-lg hover:bg-gray-800 transition-all duration-300 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Pricing
                  </Link>

                  <div className="pt-4 mt-2 border-t border-gray-700">
                    <div className="grid grid-cols-1 gap-3">
                      <Button
                        asChild
                        variant="outline"
                        className="w-full border border-gray-600 bg-gray-800 hover:bg-gray-700 text-white font-bold"
                      >
                        <Link
                          href="/login"
                          className="flex items-center justify-center"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <LogIn className="h-5 w-5 mr-2" />
                          Login
                        </Link>
                      </Button>
                      <Button
                        asChild
                        className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold"
                      >
                        <Link
                          href="/register"
                          className="flex items-center justify-center"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <UserPlus className="h-5 w-5 mr-2" />
                          Register
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </header>
  );
}
