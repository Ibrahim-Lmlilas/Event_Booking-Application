'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { User, LogOut } from 'lucide-react';
import { toast } from 'sonner';

type Props = {
  onMenuClick: () => void;
  sidebarOpen?: boolean;
};

export default function ParticipantHeader({ onMenuClick, sidebarOpen = false }: Props) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const handleLogout = async () => {
    logout();
    toast.success('Logged out successfully!');
    router.push('/');
  };

  return (
    <>
      <header
        className={`header-container bg-gray-900/75 backdrop-blur-md mt-4 mx-2 rounded-2xl shadow-lg border-2 border-white transition-all duration-300 ${sidebarOpen ? 'lg:mx-2' : ''}`}
      >
        <div
          className={`flex items-center justify-between px-3 sm:px-4 lg:px-6 py-4 sm:py-5 transition-all duration-300 ${sidebarOpen ? 'lg:px-6' : ''}`}
        >
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={onMenuClick}
              className="text-white hover:text-gray-300 lg:hidden p-1 transition-colors"
              aria-label="Open menu"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h1
              className={`text-lg sm:text-xl lg:text-xl font-bold text-white transition-all duration-300 ${sidebarOpen ? 'hidden lg:block' : ''}`}
            >
              {user?.firstName ? (
                <>
                  <span className="text-blue-500">{user.firstName.charAt(0)}</span>
                  {user.firstName.slice(1)}
                </>
              ) : (
                <>
                  <span className="text-blue-500">M</span>y Dashboard
                </>
              )}
            </h1>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
            <span className="text-xs sm:text-sm text-white hidden md:block truncate max-w-[120px] lg:max-w-none">
              {user?.firstName} {user?.lastName}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsUserModalOpen(true)}
              className="p-1.5 sm:p-2 border-gray-600 bg-gray-800 hover:bg-gray-700 text-white"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="group flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 border-gray-600 bg-gray-800 hover:bg-gray-800 text-white transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:text-pink-500 transition-colors" />
              <span className="hidden sm:inline text-sm group-hover:text-pink-500 transition-colors">
                Logout
              </span>
            </Button>
          </div>
        </div>
      </header>
      <style>{`
        .header-container {
          position: sticky;
          top: 0;
          z-index: 10;
        }
      `}</style>

      {/* Modal User Info */}
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-w-[95vw] mx-auto bg-white">
          <DialogHeader className="border-b pb-3 sm:pb-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-gray-100 rounded-lg">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg">My Information</DialogTitle>
              </div>
            </div>
          </DialogHeader>
          {user && (
            <div className="space-y-2 sm:space-y-3 py-3 sm:py-4">
              <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[1fr_2fr] gap-2 sm:gap-4 items-center border-b pb-2 sm:pb-3">
                <Label className="text-xs sm:text-sm text-gray-700">First Name</Label>
                <p className="text-xs sm:text-sm font-medium truncate text-gray-900">
                  {user.firstName}
                </p>
              </div>
              <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[1fr_2fr] gap-2 sm:gap-4 items-center border-b pb-2 sm:pb-3">
                <Label className="text-xs sm:text-sm text-gray-700">Last Name</Label>
                <p className="text-xs sm:text-sm font-medium truncate text-gray-900">
                  {user.lastName}
                </p>
              </div>
              <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[1fr_2fr] gap-2 sm:gap-4 items-center border-b pb-2 sm:pb-3">
                <Label className="text-xs sm:text-sm text-gray-700">Email</Label>
                <p className="text-xs sm:text-sm font-medium truncate text-gray-900">
                  {user.email}
                </p>
              </div>
              <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[1fr_2fr] gap-2 sm:gap-4 items-center">
                <Label className="text-xs sm:text-sm text-gray-700">Role</Label>
                <span
                  className={`px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full w-fit ${
                    user.role === UserRole.ADMIN
                      ? 'bg-pink-100 text-pink-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {user.role === UserRole.ADMIN ? 'Administrator' : 'Participant'}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
