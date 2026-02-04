'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Check if user is authenticated
      if (!user) {
        router.push('/');
        return;
      }
      
      // Check if user is admin
      const role = String(user.role || '').toLowerCase().trim();
      if (role !== 'admin') {
        // Redirect to appropriate dashboard based on role
        if (role === 'participant') {
          router.push('/dashboard/participant');
        } else {
          router.push('/');
        }
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
  if (role !== 'admin') {
    return null;
  }

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">
          Welcome back, {user.firstName} {user.lastName}
        </p>
      </div>

      {/* Main Content */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Events</h3>
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-600 mt-2">Manage all events</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Reservations</h3>
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-600 mt-2">View all bookings</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-600 mt-2">Manage users</p>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-pink-500 transition-colors text-left">
              <h3 className="font-semibold">Create New Event</h3>
              <p className="text-sm text-gray-300 mt-1">Add a new event to the platform</p>
            </button>
            <button className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-pink-500 transition-colors text-left">
              <h3 className="font-semibold">Manage Events</h3>
              <p className="text-sm text-gray-300 mt-1">View and edit existing events</p>
            </button>
            <button className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-pink-500 transition-colors text-left">
              <h3 className="font-semibold">View Reservations</h3>
              <p className="text-sm text-gray-300 mt-1">See all event reservations</p>
            </button>
            <button className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-pink-500 transition-colors text-left">
              <h3 className="font-semibold">User Management</h3>
              <p className="text-sm text-gray-300 mt-1">Manage user accounts</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
