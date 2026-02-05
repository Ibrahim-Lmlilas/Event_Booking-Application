'use client';

import { useEffect, useRef, useState } from 'react';
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
import { Search, X } from 'lucide-react';

export type Filters = {
  search: string;
  minPrice: string;
  maxPrice: string;
  date: string;
  time: string;
};

type Props = {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onReset: () => void;
};

const TIME_OPTIONS = [
  { value: 'all', label: 'All Times' },
  { value: '00', label: '12:00 AM - 5:59 AM' },
  { value: '06', label: '6:00 AM - 11:59 AM' },
  { value: '12', label: '12:00 PM - 5:59 PM' },
  { value: '18', label: '6:00 PM - 11:59 PM' },
];

export function ParticipantEventsFilters({ filters, onFiltersChange, onReset }: Props) {
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [searchValue, setSearchValue] = useState(filters.search);

  // Sync searchValue with filters.search when filters change externally
  useEffect(() => {
    setSearchValue(filters.search);
  }, [filters.search]);

  const handleChange = (key: keyof Filters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    
    // Debounce search input (300ms delay - reduced for better responsiveness)
    if (key === 'search') {
      setSearchValue(value); // Update local state immediately for responsive typing
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(() => {
        onFiltersChange(newFilters);
      }, 300) as ReturnType<typeof setTimeout>;
    } else {
      // Immediate update for other filters
      onFiltersChange(newFilters);
    }
  };

  const handleReset = () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    setSearchValue(''); // Reset local search state
    onReset();
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const hasActiveFilters = 
    filters.search ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.date ||
    (filters.time && filters.time !== 'all');

  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search" className="text-sm font-medium text-gray-700">
            Search
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Search events..."
              value={searchValue}
              onChange={(e) => handleChange('search', e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
        </div>

        {/* Min Price */}
        <div className="space-y-2">
          <Label htmlFor="minPrice" className="text-sm font-medium text-gray-700">
            Min Price (DH)
          </Label>
          <Input
            id="minPrice"
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            value={filters.minPrice}
            onChange={(e) => handleChange('minPrice', e.target.value)}
            className="bg-white"
          />
        </div>

        {/* Max Price */}
        <div className="space-y-2">
          <Label htmlFor="maxPrice" className="text-sm font-medium text-gray-700">
            Max Price (DH)
          </Label>
          <Input
            id="maxPrice"
            type="number"
            min="0"
            step="0.01"
            placeholder="1000"
            value={filters.maxPrice}
            onChange={(e) => handleChange('maxPrice', e.target.value)}
            className="bg-white"
          />
        </div>

        {/* Date */}
        <div className="space-y-2">
          <Label htmlFor="date" className="text-sm font-medium text-gray-700">
            Date
          </Label>
          <Input
            id="date"
            type="date"
            value={filters.date}
            onChange={(e) => handleChange('date', e.target.value)}
            className="bg-white"
          />
        </div>

        {/* Time */}
        <div className="space-y-2">
          <Label htmlFor="time" className="text-sm font-medium text-gray-700">
            Time
          </Label>
          <Select value={filters.time || 'all'} onValueChange={(value) => handleChange('time', value === 'all' ? '' : value)}>
            <SelectTrigger className="bg-white border-gray-300">
              <SelectValue placeholder="All Times" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {TIME_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} className="bg-white hover:bg-gray-100">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
