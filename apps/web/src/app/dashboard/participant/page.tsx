'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function ParticipantDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Check if user is authenticated
      if (!user) {
        router.push('/');
        return;
      }
      
      // Check if user is participant
      const role = String(user.role || '').toLowerCase().trim();
      if (role === 'admin') {
        // Redirect admin to admin dashboard
        router.push('/dashboard/admin');
      } else if (role !== 'participant') {
        // Unknown role, redirect to home
        router.push('/');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const role = String(user.role || '').toLowerCase().trim();
  if (role === 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Welcome back, {user.firstName} {user.lastName}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">My Reservations</h3>
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-600 mt-2">View your bookings</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Upcoming Events</h3>
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-600 mt-2">Events you're attending</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Past Events</h3>
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-600 mt-2">Your event history</p>
          </div>
        </div>

        {/* Participant Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-pink-500 transition-colors text-left"
            >
              <h3 className="font-semibold">Browse Events</h3>
              <p className="text-sm text-gray-300 mt-1">Discover and book events</p>
            </button>
            <button className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-pink-500 transition-colors text-left">
              <h3 className="font-semibold">My Reservations</h3>
              <p className="text-sm text-gray-300 mt-1">View your bookings</p>
            </button>
            <button className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-pink-500 transition-colors text-left">
              <h3 className="font-semibold">Profile Settings</h3>
              <p className="text-sm text-gray-300 mt-1">Update your information</p>
            </button>
            <button className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-pink-500 transition-colors text-left">
              <h3 className="font-semibold">Notifications</h3>
              <p className="text-sm text-gray-300 mt-1">View your notifications</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
