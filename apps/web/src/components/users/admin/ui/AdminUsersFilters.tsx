'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
};

export function AdminUsersFilters({ search, onSearchChange }: Props) {
  return (
    <div className="mb-6">
      <div className="w-1/2 min-w-[200px]">
        <Label htmlFor="search" className="text-xs text-gray-600">
          Search
        </Label>
        <Input
          id="search"
          type="text"
          placeholder="Name or email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="mt-1 bg-white"
        />
      </div>
    </div>
  );
}
