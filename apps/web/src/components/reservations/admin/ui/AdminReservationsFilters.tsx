'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { ReservationFilters } from '@/lib/api/reservations';

type Props = {
  filters: ReservationFilters;
  onFiltersChange: (filters: ReservationFilters) => void;
};

export function AdminReservationsFilters({ filters, onFiltersChange }: Props) {
  const handleChange = (key: keyof ReservationFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const handleReset = () => {
    onFiltersChange({});
  };

  return (
    <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div>
        <Label htmlFor="eventTitle" className="text-xs text-gray-600">
          Event Title
        </Label>
        <Input
          id="eventTitle"
          type="text"
          placeholder="Search by event title"
          value={filters.eventTitle || ''}
          onChange={e => handleChange('eventTitle', e.target.value)}
          className="mt-1 bg-white"
        />
      </div>
      <div>
        <Label htmlFor="userName" className="text-xs text-gray-600">
          User Name
        </Label>
        <Input
          id="userName"
          type="text"
          placeholder="Search by first or last name"
          value={filters.userName || ''}
          onChange={e => handleChange('userName', e.target.value)}
          className="mt-1 bg-white"
        />
      </div>
      <div>
        <Label htmlFor="status" className="text-xs text-gray-600">
          Status
        </Label>
        <Select
          value={filters.status || 'all'}
          onValueChange={value => handleChange('status', value === 'all' ? '' : value)}
        >
          <SelectTrigger className="mt-1 bg-white">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all" className="hover:cursor-pointer">
              All Statuses
            </SelectItem>
            <SelectItem value="PENDING" className="hover:cursor-pointer">
              PENDING
            </SelectItem>
            <SelectItem value="CONFIRMED" className="hover:cursor-pointer">
              CONFIRMED
            </SelectItem>
            <SelectItem value="REFUSED" className="hover:cursor-pointer">
              REFUSED
            </SelectItem>
            <SelectItem value="CANCELED" className="hover:cursor-pointer">
              CANCELED
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-end">
        <Button
          onClick={handleReset}
          variant="outline"
          className="w-full bg-white hover:bg-gray-100"
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
