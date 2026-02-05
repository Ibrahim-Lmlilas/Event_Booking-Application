import { CalendarX } from 'lucide-react';

export function ReservedEventsEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <CalendarX className="h-16 w-16 text-gray-400 mb-4" />
      <p className="text-lg font-semibold text-gray-600">No reservations yet</p>
      <p className="text-sm text-gray-500 mt-2">Start exploring events to make your first reservation!</p>
    </div>
  );
}
