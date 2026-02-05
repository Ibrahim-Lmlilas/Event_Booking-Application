import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Calendar, MapPin, Users } from 'lucide-react';
import type { Event, EventStatus } from '@/lib/api/events';

const STATUS_LABELS: Record<EventStatus, string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  CANCELED: 'Canceled',
};

type Props = {
  events: Event[];
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
  onStatusChange: (event: Event, status: EventStatus) => void;
};

export function AdminEventsTable({ events, onEdit, onDelete, onStatusChange }: Props) {
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
              <div className="mt-3">
                <span
                  className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-full ${
                    ev.status === 'PUBLISHED'
                      ? 'bg-green-100 text-green-800'
                      : ev.status === 'CANCELED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {STATUS_LABELS[ev.status]}
                </span>
              </div>
              <div className="mt-4 pt-3 border-t border-white/20 flex flex-wrap gap-2">
                {ev.status !== 'PUBLISHED' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onStatusChange(ev, 'PUBLISHED')}
                    className="flex-1 sm:flex-none bg-white hover:bg-gray-100 text-gray-900 border-gray-300"
                  >
                    Publish
                  </Button>
                )}
                {ev.status !== 'CANCELED' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onStatusChange(ev, 'CANCELED')}
                    className="flex-1 sm:flex-none bg-white hover:bg-gray-100 text-gray-900 border-gray-300"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(ev)}
                  className="bg-white hover:bg-gray-100 text-gray-900 border-gray-300"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white hover:bg-gray-100 text-red-600 hover:text-red-700 border-gray-300"
                  onClick={() => onDelete(ev)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
