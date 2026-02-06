'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { LogIn, UserPlus, X, LogOut, LayoutDashboard } from 'lucide-react';
import { SignInDialog } from '@/components/auth/SignInDialog';
import { SignUpDialog } from '@/components/auth/SignUpDialog';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/lib/hooks/useAuth';

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);

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

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
  };

  const handleDashboard = () => {
    const role = String(user?.role || '')
      .toLowerCase()
      .trim();
    if (role === 'admin') {
      router.push('/dashboard/admin');
    } else {
      router.push('/dashboard/participant');
    }
  };

  return (
    <header
      id="navbar"
      className={`fixed z-20 transition-all duration-300 ${
        isScrolled
          ? 'bg-gray-900/75 backdrop-blur-md mt-4 left-6 right-6 rounded-2xl shadow-lg border-2 border-white'
          : 'bg-gray-300 backdrop-blur-sm w-full border-b-4 border-black'
      }`}
    >
      <div
        className={`mx-auto px-6 py-5 transition-all duration-300 ${
          isScrolled ? 'container' : 'container'
        }`}
      >
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <div className="flex items-center h-full -my-5">
            <Link href="/" className="h-full flex items-center">
              <Image
                src="/logo.svg"
                alt="eventzi logo"
                width={100}
                height={100}
                className={`h-20 w-20 object-contain transition-[filter] duration-300 ${
                  isScrolled ? '[filter:brightness(0)_invert(1)]' : ''
                }`}
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-16">
            <Link
              href="/"
              className={`group relative transition-colors font-bold ${
                isScrolled ? 'text-white hover:text-gray-300' : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Home
              <span className="absolute left-0 bottom-0 h-0.5 w-0 bg-pink-500 transition-all duration-300 ease-in-out group-hover:w-full" />
            </Link>
            <Link
              href="/#events"
              className={`group relative transition-colors font-bold ${
                isScrolled ? 'text-white hover:text-gray-300' : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Events
              <span className="absolute left-0 bottom-0 h-0.5 w-0 bg-pink-500 transition-all duration-300 ease-in-out group-hover:w-full" />
            </Link>
            <Link
              href="/#about"
              className={`group relative transition-colors font-bold ${
                isScrolled ? 'text-white hover:text-gray-300' : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              About
              <span className="absolute left-0 bottom-0 h-0.5 w-0 bg-pink-500 transition-all duration-300 ease-in-out group-hover:w-full" />
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleDashboard}
                  className={`rounded-lg transition-all font-bold ${
                    isScrolled
                      ? 'border-gray-600 bg-gray-800 hover:bg-gray-700 text-white'
                      : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-900'
                  }`}
                >
                  <LayoutDashboard className="h-5 w-5 mr-2" />
                  Dashboard
                </Button>
                <Button
                  onClick={handleLogout}
                  className={`rounded-lg transition-all font-bold ${
                    isScrolled
                      ? 'bg-gray-800 hover:bg-pink-500 text-white'
                      : 'bg-gray-900 hover:bg-pink-500 text-white'
                  }`}
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setSignInOpen(true)}
                  className={`rounded-lg transition-all font-bold ${
                    isScrolled
                      ? 'border-gray-600 bg-gray-800 hover:bg-gray-700 text-white'
                      : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-900'
                  }`}
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  Login
                </Button>
                <Button
                  onClick={() => setSignUpOpen(true)}
                  className={`rounded-lg transition-all font-bold ${
                    isScrolled
                      ? 'bg-gray-800 hover:bg-gray-700 text-white'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Register
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              className={`focus:outline-none transition-colors duration-300 ${
                isScrolled ? 'text-white hover:text-gray-300' : 'text-gray-900 hover:text-gray-700'
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
                    href="/#events"
                    className="text-white hover:text-gray-300 flex items-center py-3 px-4 rounded-lg hover:bg-gray-800 transition-all duration-300 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Events
                  </Link>
                  <Link
                    href="/#about"
                    className="text-white hover:text-gray-300 flex items-center py-3 px-4 rounded-lg hover:bg-gray-800 transition-all duration-300 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    About
                  </Link>

                  <div className="pt-4 mt-2 border-t border-gray-700">
                    <div className="grid grid-cols-1 gap-3">
                      {user ? (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => {
                              handleDashboard();
                              setMobileMenuOpen(false);
                            }}
                            className="w-full border border-gray-600 bg-gray-800 hover:bg-gray-700 text-white font-bold"
                          >
                            <LayoutDashboard className="h-5 w-5 mr-2" />
                            Dashboard
                          </Button>
                          <Button
                            onClick={() => {
                              handleLogout();
                              setMobileMenuOpen(false);
                            }}
                            className="w-full bg-gray-800 hover:bg-pink-500 text-white font-bold"
                          >
                            <LogOut className="h-5 w-5 mr-2" />
                            Logout
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSignInOpen(true);
                              setMobileMenuOpen(false);
                            }}
                            className="w-full border border-gray-600 bg-gray-800 hover:bg-gray-700 text-white font-bold"
                          >
                            <LogIn className="h-5 w-5 mr-2" />
                            Login
                          </Button>
                          <Button
                            onClick={() => {
                              setSignUpOpen(true);
                              setMobileMenuOpen(false);
                            }}
                            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold"
                          >
                            <UserPlus className="h-5 w-5 mr-2" />
                            Register
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Dialogs */}
      <SignInDialog
        open={signInOpen}
        onOpenChange={setSignInOpen}
        onSwitchToSignUp={() => {
          setSignInOpen(false);
          setSignUpOpen(true);
        }}
      />
      <SignUpDialog
        open={signUpOpen}
        onOpenChange={setSignUpOpen}
        onSwitchToSignIn={() => {
          setSignUpOpen(false);
          setSignInOpen(true);
        }}
      />
    </header>
  );
}
