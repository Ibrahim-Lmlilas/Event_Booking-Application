'use client';

import { useEffect, useState } from 'react';
import { eventsApi, type Event, type PaginatedEventsResponse } from '@/lib/api/events';
import { reservationsApi, type ReservationWithEvent } from '@/lib/api/reservations';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  ParticipantEventsGrid,
  ParticipantEventsEmpty,
  ParticipantEventsFilters,
  type Filters,
} from './ui';

const ITEMS_PER_PAGE = 9;

type Props = {
  initialData: PaginatedEventsResponse;
  initialPage: number;
};

export function ParticipantEventsClient({ initialData, initialPage }: Props) {
  const [data, setData] = useState(initialData);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [reservations, setReservations] = useState<ReservationWithEvent[]>([]);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    minPrice: '',
    maxPrice: '',
    date: '',
    time: 'all',
  });

  const fetchReservations = async () => {
    try {
      const data = await reservationsApi.findAll();
      setReservations(data || []);
    } catch (error) {
      // Silently fail - reservations are optional
      setReservations([]);
    }
  };

  const fetchEvents = async (currentPage: number = page, currentFilters?: Filters) => {
    try {
      setLoading(true);
      const filterParams = currentFilters || filters;
      const apiFilters = {
        search: filterParams.search || undefined,
        minPrice: filterParams.minPrice ? parseFloat(filterParams.minPrice) : undefined,
        maxPrice: filterParams.maxPrice ? parseFloat(filterParams.maxPrice) : undefined,
        date: filterParams.date || undefined,
        time: filterParams.time && filterParams.time !== 'all' ? filterParams.time : undefined,
      };
      const newData = await eventsApi.listPublished(currentPage, ITEMS_PER_PAGE, apiFilters);
      setData(newData || { events: [], total: 0, page: 1, limit: ITEMS_PER_PAGE, totalPages: 0 });
      setPage(newData?.page || currentPage);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to load events');
      setData({ events: [], total: 0, page: 1, limit: ITEMS_PER_PAGE, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  useEffect(() => {
    if (page !== initialPage) {
      fetchEvents(page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
    fetchEvents(1, newFilters);
  };

  const handleFiltersReset = () => {
    const emptyFilters: Filters = {
      search: '',
      minPrice: '',
      maxPrice: '',
      date: '',
      time: '',
    };
    setFilters(emptyFilters);
    setPage(1);
    fetchEvents(1, emptyFilters);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= data.totalPages && newPage !== page) {
      setPage(newPage);
    }
  };

  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    if (data.totalPages <= 7) {
      for (let i = 1; i <= data.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(data.totalPages);
      } else if (page >= data.totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = data.totalPages - 3; i <= data.totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = page - 1; i <= page + 1; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(data.totalPages);
      }
    }
    return pages;
  };

  return (
    <div>
      <ParticipantEventsFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleFiltersReset}
      />

      {loading && !data.events.length ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : !data.events || data.events.length === 0 ? (
        <ParticipantEventsEmpty />
      ) : (
        <>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : (
            <>
              <ParticipantEventsGrid 
                events={data.events}
                reservations={reservations}
                onReservationSuccess={() => {
                  fetchEvents(page, filters);
                  fetchReservations();
                }}
              />

              {data.totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e: React.MouseEvent) => {
                            e.preventDefault();
                            handlePageChange(page - 1);
                          }}
                          className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                      {getPageNumbers().map((p, idx) => (
                        <PaginationItem key={idx}>
                          {p === 'ellipsis' ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              href="#"
                              onClick={(e: React.MouseEvent) => {
                                e.preventDefault();
                                handlePageChange(p as number);
                              }}
                              isActive={page === p}
                              className="bg-white hover:bg-gray-100 text-gray-900"
                            >
                              {p}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e: React.MouseEvent) => {
                            e.preventDefault();
                            handlePageChange(page + 1);
                          }}
                          className={page === data.totalPages ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
