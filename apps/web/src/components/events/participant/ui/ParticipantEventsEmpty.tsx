import { CalendarX } from 'lucide-react';

export function ParticipantEventsEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <CalendarX className="h-16 w-16 text-gray-400 mb-4" />
    </div>
  );
}
