'use client';

import { Calendar, MapPin, User, CheckCircle2, XCircle, Ban, Clock } from 'lucide-react';
import type { ReservationWithEvent } from '@/lib/api/reservations';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Props = {
  reservations: ReservationWithEvent[];
  onStatusUpdate: (id: string, status: 'PENDING' | 'CONFIRMED' | 'REFUSED' | 'CANCELED') => void;
};

export function AdminReservationsTable({ reservations, onStatusUpdate }: Props) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REFUSED':
        return 'bg-red-100 text-red-800';
      case 'CANCELED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'REFUSED':
        return <XCircle className="h-4 w-4" />;
      case 'CANCELED':
        return <Ban className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Event
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Participant
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Created
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reservations
              .filter((reservation) => {
                const event = reservation.eventId;
                const user = reservation.userId;
                if (!event || !user) return false;
                if (typeof event !== 'object' || typeof user !== 'object') return false;
                if (!('title' in event) || !('email' in user)) return false;
                return true;
              })
              .map((reservation) => {
                const event = reservation.eventId as any;
                const user = reservation.userId as any;
                if (!event || !user || typeof event !== 'object' || typeof user !== 'object' || !event.title || !user.email) {
                  return null;
                }
                return (
                <tr key={reservation._id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900">{event.title}</span>
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </span>
                        <span className="text-xs text-gray-500">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-sm text-gray-900">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                      <span className="text-gray-400">·</span>
                      <span>{event.time}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center hover:cursor-pointer">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        reservation.status,
                      )}`}
                    >
                      {getStatusIcon(reservation.status)}
                      {reservation.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center text-sm text-gray-500">
                    {reservation.createdAt
                      ? new Date(reservation.createdAt).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex justify-center hover:cursor-pointer">
                      <Select
                        value={reservation.status}
                        onValueChange={(value: 'PENDING' | 'CONFIRMED' | 'REFUSED' | 'CANCELED') =>
                          onStatusUpdate(reservation._id, value)
                        }
                      >
                        <SelectTrigger className="w-40 bg-white hover:cursor-pointer">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="PENDING" className="hover:cursor-pointer">PENDING</SelectItem>
                          <SelectItem value="CONFIRMED" className="hover:cursor-pointer">CONFIRMED</SelectItem>
                          <SelectItem value="REFUSED" className="hover:cursor-pointer">REFUSED</SelectItem>
                          <SelectItem value="CANCELED" className="hover:cursor-pointer">CANCELED</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
