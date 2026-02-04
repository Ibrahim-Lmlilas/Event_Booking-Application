'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import type { CreateEventPayload, Event } from '@/lib/api/events';

export type FormErrors = {
  title?: string;
  description?: string;
  date?: string;
  time?: string;
  location?: string;
  capacity?: string;
};

type Props = {
  open: boolean;
  form: CreateEventPayload;
  setForm: React.Dispatch<React.SetStateAction<CreateEventPayload>>;
  errors: FormErrors;
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  saving: boolean;
  editEvent: Event | null;
};

export function AdminEventFormDialog({
  open,
  form,
  setForm,
  errors,
  setErrors,
  onSubmit,
  onClose,
  saving,
  editEvent,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent
        className="sm:max-w-[500px] text-gray-900"
        style={{
          background: 'linear-gradient(200deg, white 0%, white 80%, #ea05ef 90%)',
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-gray-900">
            {editEvent ? 'Edit event' : 'Create event'}
          </DialogTitle>
          
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-700 font-medium">
              Title
            </Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => {
                setForm((f) => ({ ...f, title: e.target.value }));
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              placeholder="Event title"
              className={`h-12 px-4 transition-colors ${
                errors.title
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-gray-900 focus:ring-gray-900'
              }`}
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-700 font-medium">
              Description
            </Label>
            <Input
              id="description"
              value={form.description}
              onChange={(e) => {
                setForm((f) => ({ ...f, description: e.target.value }));
                if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
              }}
              placeholder="Event description (2–60 characters)"
              maxLength={60}
              className={`h-12 px-4 transition-colors ${
                errors.description
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-gray-900 focus:ring-gray-900'
              }`}
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-gray-700 font-medium">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => {
                  setForm((f) => ({ ...f, date: e.target.value }));
                  if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
                }}
                className={`h-12 px-4 transition-colors ${
                  errors.date
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-gray-900 focus:ring-gray-900'
                }`}
              />
              {errors.date && (
                <p className="text-sm text-red-500 mt-1">{errors.date}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" className="text-gray-700 font-medium">
                Time
              </Label>
              <Input
                id="time"
                type="time"
                value={form.time}
                onChange={(e) => {
                  setForm((f) => ({ ...f, time: e.target.value }));
                  if (errors.time) setErrors((prev) => ({ ...prev, time: undefined }));
                }}
                className={`h-12 px-4 transition-colors ${
                  errors.time
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-gray-900 focus:ring-gray-900'
                }`}
              />
              {errors.time && (
                <p className="text-sm text-red-500 mt-1">{errors.time}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-gray-700 font-medium">
              Location
            </Label>
            <Input
              id="location"
              value={form.location}
              onChange={(e) => {
                setForm((f) => ({ ...f, location: e.target.value }));
                if (errors.location) setErrors((prev) => ({ ...prev, location: undefined }));
              }}
              placeholder="Venue or address"
              className={`h-12 px-4 transition-colors ${
                errors.location
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-gray-900 focus:ring-gray-900'
              }`}
            />
            {errors.location && (
              <p className="text-sm text-red-500 mt-1">{errors.location}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity" className="text-gray-700 font-medium">
              Capacity
            </Label>
            <Input
              id="capacity"
              type="number"
              min={1}
              value={form.capacity}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                setForm((f) => ({ ...f, capacity: Number.isNaN(v) ? 0 : v }));
                if (errors.capacity) setErrors((prev) => ({ ...prev, capacity: undefined }));
              }}
              placeholder="1"
              className={`h-12 px-4 transition-colors ${
                errors.capacity
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-gray-900 focus:ring-gray-900'
              }`}
            />
            {errors.capacity && (
              <p className="text-sm text-red-500 mt-1">{errors.capacity}</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="h-12 px-6">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="h-12 px-6 bg-gray-900 hover:bg-pink-500 text-white font-semibold rounded-lg transition-all duration-300"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editEvent ? 'Updating...' : 'Creating...'}
                </>
              ) : editEvent ? (
                'Update'
              ) : (
                'Create'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
