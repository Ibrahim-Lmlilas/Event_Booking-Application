'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { reservationsApi, type ReservationWithEvent } from '@/lib/api/reservations';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ReservedEventsGrid } from './ui/ReservedEventsGrid';
import { ReservedEventsEmpty } from './ui/ReservedEventsEmpty';

export function ParticipantReservationsClient() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<ReservationWithEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await reservationsApi.findAll();
      setReservations(data || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load reservations');
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/');
        return;
      }
      
      const role = String(user.role || '').toLowerCase().trim();
      if (role === 'admin') {
        router.push('/dashboard/admin');
        return;
      } else if (role !== 'participant') {
        router.push('/');
        return;
      }

      fetchReservations();
    }
  }, [user, authLoading, router, fetchReservations]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Reservations</h1>
        <p className="text-sm text-gray-600 mt-1">
          Events you have reserved
        </p>
      </div>

      {!reservations || reservations.length === 0 ? (
        <ReservedEventsEmpty />
      ) : (
        <ReservedEventsGrid reservations={reservations} />
      )}
    </div>
  );
}
