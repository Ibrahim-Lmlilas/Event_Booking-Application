'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { eventsApi } from '@/lib/api/events';
import type { IEvent, IEventCreate } from '@/types';
import { EventStatus } from '@/types';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  AdminEventsHeader,
  AdminEventsEmpty,
  AdminEventsTable,
  AdminEventFormDialog,
  type FormErrors,
} from './ui';

const ITEMS_PER_PAGE = 6;

export function AdminEventsClient() {
  const { loading: authLoading } = useAuth();
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<IEvent | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<IEventCreate>({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    capacity: 50,
    price: 0,
    bg: 'event1.jpg',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [eventToDelete, setEventToDelete] = useState<IEvent | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.title?.trim()) newErrors.title = 'Title is required';
    if (!form.date) newErrors.date = 'Date is required';
    else {
      const selected = new Date(form.date);
      selected.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) newErrors.date = 'Date must be in the future';
    }
    if (!form.time?.trim()) newErrors.time = 'Time is required';
    if (!form.location?.trim()) newErrors.location = 'Location is required';
    const desc = form.description?.trim() ?? '';
    if (!desc) newErrors.description = 'Description is required';
    else if (desc.length < 2) newErrors.description = 'Description must be at least 2 characters';
    else if (desc.length > 60) newErrors.description = 'Description must be at most 60 characters';
    const cap = Number(form.capacity);
    if (!Number.isInteger(cap) || cap < 1) newErrors.capacity = 'Capacity must be at least 1';
    const price = Number(form.price);
    if (isNaN(price) || price < 0) newErrors.price = 'Price must be at least 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchEvents = async (currentPage: number = page) => {
    try {
      setLoading(true);
      const data = await eventsApi.list(currentPage, ITEMS_PER_PAGE);
      setEvents(data.events || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
      setPage(data.page || currentPage);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to load events');
      setEvents([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(page);
  }, [page]);

  const openCreate = () => {
    setForm({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      capacity: 50,
      price: 0,
      bg: 'event1.jpg',
    });
    setErrors({});
    setEditEvent(null);
    setCreateOpen(true);
  };

  const openEdit = (event: IEvent) => {
    setEditEvent(event);
    setForm({
      title: event.title,
      description: event.description || '',
      date:
        event.date instanceof Date
          ? event.date.toISOString().slice(0, 10)
          : event.date.slice(0, 10),
      time: event.time,
      location: event.location,
      capacity: event.capacity,
      price: event.price ?? 0,
      bg: event.bg || 'event1.jpg',
    });
    setErrors({});
    setCreateOpen(true);
  };

  const closeDialog = () => {
    setCreateOpen(false);
    setEditEvent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    try {
      const payload = { ...form, date: new Date(form.date).toISOString() };
      if (editEvent) {
        await eventsApi.update(editEvent._id, payload);
        toast.success('Event updated');
      } else {
        await eventsApi.create(payload);
        toast.success('Event created');
      }
      closeDialog();
      fetchEvents(page);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;
    try {
      await eventsApi.delete(eventToDelete._id);
      toast.success('Event deleted');
      // If current page becomes empty after deletion, go to previous page
      if (events.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchEvents(page);
      }
      setEventToDelete(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const handleStatusChange = async (event: IEvent, status: EventStatus) => {
    try {
      await eventsApi.updateStatus(event._id, status);
      toast.success(
        `Status set to ${status === EventStatus.PUBLISHED ? 'Published' : status === EventStatus.CANCELED ? 'Canceled' : status}`,
      );
      fetchEvents(page);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
      </div>
    );
  }

  return (
    <div>
      <AdminEventsHeader onCreateClick={openCreate} />

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : !events || events.length === 0 ? (
        <AdminEventsEmpty onCreateClick={openCreate} />
      ) : (
        <>
          <AdminEventsTable
            events={events}
            onEdit={openEdit}
            onDelete={event => setEventToDelete(event)}
            onStatusChange={handleStatusChange}
          />
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={e => {
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
                      onClick={e => {
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

      <AdminEventFormDialog
        open={createOpen}
        form={form}
        setForm={setForm}
        errors={errors}
        setErrors={setErrors}
        onSubmit={handleSubmit}
        onClose={closeDialog}
        saving={saving}
        editEvent={editEvent}
      />

      <AlertDialog
        open={eventToDelete !== null}
        onOpenChange={open => !open && setEventToDelete(null)}
      >
        <AlertDialogContent className="bg-white text-gray-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">Delete event</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              {eventToDelete
                ? `Are you sure you want to delete "${eventToDelete.title}"? This cannot be undone.`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              type="button"
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
