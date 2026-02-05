'use client';

import { useEffect, useState } from 'react';
import { reservationsApi, type ReservationWithEvent, type ReservationFilters } from '@/lib/api/reservations';
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
import { AdminReservationsTable } from './ui/AdminReservationsTable';
import { AdminReservationsFilters } from './ui/AdminReservationsFilters';
import { AdminReservationsEmpty } from './ui/AdminReservationsEmpty';

const ITEMS_PER_PAGE = 8;

export function AdminReservationsClient() {
  const [allReservations, setAllReservations] = useState<ReservationWithEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ReservationFilters>({});
  const [page, setPage] = useState(1);

  const fetchReservations = async (currentFilters?: ReservationFilters) => {
    try {
      setLoading(true);
      const filterParams = currentFilters || filters;
      const data = await reservationsApi.findAll(filterParams);
      setAllReservations(data || []);
      setPage(1); // Reset to first page when filters change
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load reservations');
      setAllReservations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleFiltersChange = (newFilters: ReservationFilters) => {
    setFilters(newFilters);
    fetchReservations(newFilters);
  };

  // Calculate pagination
  const totalPages = Math.ceil(allReservations.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const reservations = allReservations.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage);
    }
  };

  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = page - 1; i <= page + 1; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const handleStatusUpdate = async (id: string, status: 'PENDING' | 'CONFIRMED' | 'REFUSED' | 'CANCELED') => {
    try {
      await reservationsApi.updateStatus(id, status);
      toast.success('Reservation status updated successfully!');
      fetchReservations(filters);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update reservation status');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manage Reservations</h1>
        <p className="text-sm text-gray-600 mt-1">
          View and manage all event reservations
        </p>
      </div>

      <AdminReservationsFilters filters={filters} onFiltersChange={handleFiltersChange} />

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : !allReservations || allReservations.length === 0 ? (
        <AdminReservationsEmpty />
      ) : (
        <>
          <AdminReservationsTable 
            reservations={reservations} 
            onStatusUpdate={handleStatusUpdate}
          />

          {totalPages > 1 && (
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
                      className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}
