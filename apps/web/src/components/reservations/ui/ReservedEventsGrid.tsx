import { Calendar, MapPin, Users, CalendarCheck } from 'lucide-react';
import type { ReservationWithEvent } from '@/lib/api/reservations';

type Props = {
  reservations: ReservationWithEvent[];
};

export function ReservedEventsGrid({ reservations }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {reservations.map((reservation) => {
        const ev = reservation.eventId;
        const bgImage = ev.bg || 'event1.jpg';
        return (
          <div
            key={reservation._id}
            className="group rounded-xl border shadow-lg border-gray-100 overflow-hidden hover:shadow-xl transition-shadow relative"
            style={{
              backgroundImage: `url(/${bgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative p-4 sm:p-5 z-10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg text-white truncate" title={ev.title}>
                  {ev.title}
                </h3>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  reservation.status === 'CONFIRMED' 
                    ? 'bg-green-500 text-white' 
                    : reservation.status === 'PENDING'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-500 text-white'
                }`}>
                  {reservation.status}
                </span>
              </div>
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
                {reservation.createdAt && (
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-600">
                    <CalendarCheck className="h-4 w-4 flex-shrink-0 text-gray-300" />
                    <span className="text-xs text-gray-300">
                      Reserved on {new Date(reservation.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
