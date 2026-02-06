'use client';

import { useState } from 'react';
import AdminHeader from '@/components/layout/admin/AdminHeader';
import AdminSidebar from '@/components/layout/admin/AdminSidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-1 flex-col overflow-hidden lg:ml-20">
          <AdminHeader onMenuClick={() => setSidebarOpen(true)} sidebarOpen={sidebarOpen} />
          <main className="flex-1 overflow-y-auto p-2 sm:p-4 lg:p-6">{children}</main>
        </div>
        {/* Mobile overlay - gradient b7al sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 lg:hidden"
            style={{
              background:
                'linear-gradient(to bottom, #cbcbcd 0%, #cbcbcd 80%, rgb(202, 0, 94) 100%)',
            }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
