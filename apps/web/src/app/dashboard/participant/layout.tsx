'use client';

import ParticipantSidebar from '@/components/layout/participant/ParticipantSidebar';

export default function ParticipantDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <ParticipantSidebar />
      <div className="flex-1 ml-64">
        {children}
      </div>
    </div>
  );
}
