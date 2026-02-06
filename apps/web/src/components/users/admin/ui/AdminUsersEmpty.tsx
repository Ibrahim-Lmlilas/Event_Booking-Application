'use client';

import { Users } from 'lucide-react';

export function AdminUsersEmpty() {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-100 p-12 text-center">
      <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
      <p className="text-sm text-gray-600">Try adjusting your filters or search.</p>
    </div>
  );
}
