import { Calendar, MapPin, Users } from 'lucide-react';
import type { Event } from '@/lib/api/events';

type Props = {
  events: Event[];
};

export function ParticipantEventsGrid({ events }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {events.map((ev) => {
        const bgImage = ev.bg || 'event1.jpg';
        return (
          <div
            key={ev._id}
            className="rounded-xl border shadow-lg border-gray-100 overflow-hidden hover:shadow-xl transition-shadow relative"
            style={{
              backgroundImage: `url(/${bgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative p-4 sm:p-5 z-10">
              <h3 className="font-bold text-lg text-white truncate" title={ev.title}>
                {ev.title}
              </h3>
              {ev.description && (
                <p className="text-sm font-bold text-gray-200 mt-1 line-clamp-2">{ev.description}</p>
              )}
              <div className="mt-3 space-y-1.5 text-sm font-bold text-gray-100">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 flex-shrink-0 text-gray-300" />
                  <span>{new Date(ev.date).toLocaleDateString()} · {ev.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 flex-shrink-0 text-gray-300" />
                  <span className="truncate">{ev.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 flex-shrink-0 text-gray-300" />
                  <span>{ev.seatsTaken} / {ev.capacity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-300">DH</span>
                  <span>{(ev.price ?? 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
