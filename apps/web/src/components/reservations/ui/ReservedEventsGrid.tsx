import { Calendar, MapPin, Users, CalendarCheck, Download, XCircle } from 'lucide-react';
import type { ReservationWithEvent } from '@/lib/api/reservations';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

const CANCEL_HOURS_BEFORE = 24;

function getEventStart(ev: { date: string | Date; time?: string }): Date {
  const d = new Date(ev.date);
  const time = ev.time || '00:00';
  const [hours, minutes] = time.split(':').map((s) => parseInt(s, 10) || 0);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

function canCancelReservation(reservation: ReservationWithEvent): boolean {
  if (reservation.status !== 'PENDING' && reservation.status !== 'CONFIRMED') return false;
  const ev = reservation.eventId;
  if (!ev || typeof ev !== 'object' || !('date' in ev)) return false;
  const eventStart = getEventStart(ev as { date: string; time?: string });
  const minCancelTime = Date.now() + CANCEL_HOURS_BEFORE * 60 * 60 * 1000;
  return eventStart.getTime() >= minCancelTime;
}

type Props = {
  reservations: ReservationWithEvent[];
  onCancel?: (reservationId: string) => Promise<void>;
  onDownloadTicket?: (reservationId: string) => Promise<void>;
};

export function ReservedEventsGrid({ reservations, onCancel, onDownloadTicket }: Props) {
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [canceling, setCanceling] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleConfirmCancel = async () => {
    if (!cancelId || !onCancel) return;
    setCanceling(true);
    try {
      await onCancel(cancelId);
      setCancelId(null);
    } finally {
      setCanceling(false);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {reservations
        .filter((reservation) => {
          const ev = reservation.eventId;
          return ev && typeof ev === 'object' && '_id' in ev && ev.title;
        })
        .map((reservation) => {
          const ev = reservation.eventId as any;
          if (!ev || typeof ev !== 'object' || !ev.title) return null;
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
                    : reservation.status === 'REFUSED'
                    ? 'bg-red-500 text-white'
                    : reservation.status === 'CANCELED'
                    ? 'bg-gray-500 text-white'
                    : 'bg-gray-400 text-white'
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
                <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-gray-600">
                  {reservation.createdAt ? (
                    <div className="flex items-center gap-2">
                      <CalendarCheck className="h-4 w-4 flex-shrink-0 text-gray-300" />
                      <span className="text-xs text-gray-300">
                        Reserved on {new Date(reservation.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ) : (
                    <span />
                  )}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {reservation.status === 'CONFIRMED' && (
                      <Button
                        type="button"
                        size="sm"
                        className="bg-white hover:bg-gray-100 text-gray-900 font-semibold"
                        disabled={!!downloadingId}
                        onClick={async () => {
                          if (!onDownloadTicket) return;
                          setDownloadingId(reservation._id);
                          try {
                            await onDownloadTicket(reservation._id);
                          } finally {
                            setDownloadingId(null);
                          }
                        }}
                      >
                        <Download className="h-4 w-4 mr-1.5" />
                        {downloadingId === reservation._id ? 'Downloading…' : 'Download'}
                      </Button>
                    )}
                    {canCancelReservation(reservation) && (
                      <Button
                        type="button"
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => setCancelId(reservation._id)}
                      >
                        <XCircle className="h-4 w-4 mr-1.5" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <AlertDialog open={!!cancelId} onOpenChange={(open) => !open && setCancelId(null)}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">Cancel reservation?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              This will free your spot. You can only cancel at least 24 hours before the event.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={canceling} className="bg-white border-gray-300 text-gray-900 hover:bg-gray-100">
              Keep
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmCancel();
              }}
              disabled={canceling}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {canceling ? 'Canceling…' : 'Yes, cancel'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
