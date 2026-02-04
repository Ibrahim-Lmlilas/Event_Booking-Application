'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { eventsApi, type Event, type CreateEventPayload, type EventStatus } from '@/lib/api/events';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AdminEventsHeader,
  AdminEventsEmpty,
  AdminEventsTable,
  AdminEventFormDialog,
} from './ui';
import type { FormErrors } from './ui/AdminEventFormDialog';

export function AdminEventsClient() {
  const { loading: authLoading } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<Event | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CreateEventPayload>({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    capacity: 50,
  });
  const [errors, setErrors] = useState<FormErrors>({});

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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventsApi.list();
      setEvents(data);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openCreate = () => {
    setForm({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      capacity: 50,
    });
    setErrors({});
    setEditEvent(null);
    setCreateOpen(true);
  };

  const openEdit = (e: Event) => {
    setEditEvent(e);
    setForm({
      title: e.title,
      description: e.description || '',
      date: e.date.slice(0, 10),
      time: e.time,
      location: e.location,
      capacity: e.capacity,
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
      fetchEvents();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (event: Event) => {
    if (!confirm(`Delete "${event.title}"?`)) return;
    try {
      await eventsApi.delete(event._id);
      toast.success('Event deleted');
      fetchEvents();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const handleStatusChange = async (event: Event, status: EventStatus) => {
    try {
      await eventsApi.updateStatus(event._id, status);
      toast.success(`Status set to ${status === 'PUBLISHED' ? 'Published' : status === 'CANCELED' ? 'Canceled' : status}`);
      fetchEvents();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status');
    }
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
      ) : events.length === 0 ? (
        <AdminEventsEmpty onCreateClick={openCreate} />
      ) : (
        <AdminEventsTable
          events={events}
          onEdit={openEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
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
    </div>
  );
}
