import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Calendar, MapPin, Users } from 'lucide-react';
import type { Event, EventStatus } from '@/lib/api/events';

const STATUS_LABELS: Record<EventStatus, string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  CANCELED: 'Canceled',
};

const STATUS_GRADIENT_COLOR: Record<EventStatus, string> = {
  DRAFT: '#ea05ef',
  PUBLISHED: '#22c55e',
  CANCELED: '#ef4444',
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
      {events.map((ev) => (
        <div
          key={ev._id}
          className="rounded-xl border shadow-lg border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
          style={{
            background: `linear-gradient(130deg, white 0%, white 60%, ${STATUS_GRADIENT_COLOR[ev.status]} 95%)`,
          }}
        >
          <div className="p-4 sm:p-5">
            <h3 className="font-bold text-lg text-gray-900 truncate" title={ev.title}>
              {ev.title}
            </h3>
            {ev.description && (
              <p className="text-sm font-bold text-gray-500 mt-1 line-clamp-2">{ev.description}</p>
            )}
            <div className="mt-3 space-y-1.5 text-sm font-bold text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 flex-shrink-0 text-gray-400" />
                <span>{new Date(ev.date).toLocaleDateString()} · {ev.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0 text-gray-400" />
                <span className="truncate">{ev.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 flex-shrink-0 text-gray-400" />
                <span>{ev.seatsTaken} / {ev.capacity}</span>
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
            <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
              {ev.status !== 'PUBLISHED' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStatusChange(ev, 'PUBLISHED')}
                  className="flex-1 sm:flex-none"
                >
                  Publish
                </Button>
              )}
              {ev.status !== 'CANCELED' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStatusChange(ev, 'CANCELED')}
                  className="flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => onEdit(ev)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700"
                onClick={() => onDelete(ev)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
