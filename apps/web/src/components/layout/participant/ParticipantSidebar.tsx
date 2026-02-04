'use client';

import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Calendar, 
  Ticket, 
  Settings
} from 'lucide-react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const menuItems = [
  { path: '/dashboard/participant', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/dashboard/participant/events', icon: Calendar, label: 'My Events' },
  { path: '/dashboard/participant/reservations', icon: Ticket, label: 'My Reservations' },
  { path: '/dashboard/participant/settings', icon: Settings, label: 'Settings' },
];

export default function ParticipantSidebar({ isOpen, onClose }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <>
      <aside
        className={`
          sidebar-container
          fixed inset-y-0 left-0 z-50 
          text-gray-800
          transform transition-all duration-300 ease-in-out
          overflow-hidden
          lg:relative lg:translate-x-0
          rounded-none lg:rounded-xl
          m-0 lg:m-2
          h-screen lg:h-[calc(100vh-1rem)]
          shadow-lg
          ${isOpen ? 'w-64 sm:w-72' : 'w-0'}
          lg:w-20
          lg:hover:w-64
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Header */}
        <div className={`flex items-center justify-center h-14 sm:h-16 relative ${isOpen ? 'border-b border-[#b0b0b2]' : 'lg:border-b lg:border-[#b0b0b2]'}`} style={{ borderWidth: '1px' }}>
          <div className="flex items-center justify-center overflow-hidden">
            <Link href="/dashboard/participant" className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="eventzi logo"
                width={80}
                height={80}
                className="h-20 w-20 object-contain"
                priority
              />
              
            </Link>
          </div>
          <button
            onClick={onClose}
            className="absolute right-2 top-2 text-gray-600 hover:text-gray-900 lg:hidden"
            aria-label="Close menu"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col py-4 sm:py-6 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  router.push(item.path);
                  onClose();
                }}
                className={`
                  flex items-center
                  px-3 py-2.5 sm:py-3
                  text-gray-700
                  transition-all duration-200
                  hover:bg-[#b8b8ba] hover:text-gray-900
                  ${isActive ? "bg-[#b8b8ba] text-gray-900" : ""}
                `}
              >
                <span className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 flex items-center justify-center ml-3">
                <item.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </span>
                <span className="sidebar-content ml-2 sm:ml-3 whitespace-nowrap text-xs sm:text-sm font-bold">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>
      <style>{`
        .sidebar-container {
          position: relative;
          background: linear-gradient(to bottom, #cbcbcd 0%, #cbcbcd 80%,rgb(13, 240, 221) 100%);
        }
        .sidebar-content {
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        
        /* Desktop behavior */
        @media (min-width: 1024px) {
          .sidebar-container:hover .sidebar-content {
            opacity: 1;
            pointer-events: auto;
          }
        }
        
        /* Mobile/Tablet behavior - always show content when open */
        @media (max-width: 1023px) {
          .sidebar-content {
            opacity: 1;
            pointer-events: auto;
          }
        }
      `}</style>
    </>
  );
}
