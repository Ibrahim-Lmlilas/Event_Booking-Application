'use client';

import { useState } from 'react';
import ParticipantHeader from '@/components/layout/participant/ParticipantHeader';
import ParticipantSidebar from '@/components/layout/participant/ParticipantSidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function ParticipantDashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute allowedRoles={['participant']}>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <ParticipantSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-1 flex-col overflow-hidden lg:ml-20">
          <ParticipantHeader onMenuClick={() => setSidebarOpen(true)} sidebarOpen={sidebarOpen} />
          <main className="flex-1 overflow-y-auto p-2 sm:p-4 lg:p-6">{children}</main>
        </div>
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40"
            style={{
              background:
                'linear-gradient(to bottom, #cbcbcd 0%, #cbcbcd 80%,rgb(0, 107, 121) 100%)',
            }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
