'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { reservationsApi } from '@/lib/api/reservations';
import { toast } from 'sonner';
import { Loader2, CalendarCheck } from 'lucide-react';
import type { IEvent } from '@/types';

type Props = {
  event: IEvent;
  hasReservation?: boolean;
  onReservationSuccess?: () => void;
};

export function ReserveButton({ event, hasReservation = false, onReservationSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const handleReserve = async () => {
    try {
      setLoading(true);
      await reservationsApi.create({ eventId: event._id });
      toast.success('Reservation created successfully!');
      onReservationSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create reservation';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Check if event can be reserved
  const isFull = event.seatsTaken >= event.capacity;
  const isCanceled = event.status === 'CANCELED';
  const isDraft = event.status === 'DRAFT';
  const canReserve = !isFull && !isCanceled && !isDraft && !hasReservation;

  return (
    <Button
      onClick={handleReserve}
      disabled={loading || !canReserve}
      className="bg-white hover:bg-gray-100 text-gray-900 font-semibold"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Reserving...
        </>
      ) : isFull ? (
        'Event Full'
      ) : isCanceled ? (
        'Event Canceled'
      ) : isDraft ? (
        'Not Available'
      ) : hasReservation ? (
        <>
          <CalendarCheck className="h-4 w-4 mr-2" />
          Already Reserved
        </>
      ) : (
        <>
          <CalendarCheck className="h-4 w-4 mr-2" />
          Reserve Now
        </>
      )}
    </Button>
  );
}
