import { TicketX } from 'lucide-react';

export function AdminReservationsEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow">
      <TicketX className="h-16 w-16 text-gray-400 mb-4" />
      <p className="text-lg font-semibold text-gray-600">No reservations found</p>
      <p className="text-sm text-gray-500 mt-2">Try adjusting your filters</p>
    </div>
  );
}
