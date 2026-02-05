'use client';

import { useState, useEffect } from 'react';
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
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { CreateEventPayload, Event } from '@/lib/api/events';

export type FormErrors = {
  bg?: string;
  title?: string;
  description?: string;
  date?: string;
  time?: string;
  location?: string;
  capacity?: string;
  price?: string;
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

const BACKGROUND_IMAGES = ['event1.jpg', 'event2.jpg', 'event3.jpg', 'event4.jpg'];

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
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  useEffect(() => {
    if (open) {
      setStep(1);
    }
  }, [open]);

  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.bg?.trim()) newErrors.bg = 'Background image is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.title?.trim()) newErrors.title = 'Title is required';
    const desc = form.description?.trim() ?? '';
    if (!desc) newErrors.description = 'Description is required';
    else if (desc.length < 2) newErrors.description = 'Description must be at least 2 characters';
    else if (desc.length > 60) newErrors.description = 'Description must be at most 60 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: FormErrors = {};
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
    const cap = Number(form.capacity);
    if (!Number.isInteger(cap) || cap < 1) newErrors.capacity = 'Capacity must be at least 1';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handlePrevious = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Prevent any automatic form submission - only submit via button click
  };

  const handleSubmitClick = () => {
    if (step === 3 && validateStep3()) {
      const fakeEvent = {
        preventDefault: () => {},
      } as React.FormEvent;
      onSubmit(fakeEvent);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const handleClose = () => {
    setStep(1);
    setErrors({});
    onClose();
  };

  const bgImage = form.bg || 'event1.jpg';

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        <div
          className="relative bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(/${bgImage})`,
          }}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative p-6 z-10">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editEvent ? 'Edit event' : 'Create event'}
              </DialogTitle>
              <DialogDescription className="text-gray-200">
                Step {step} of {totalSteps}
              </DialogDescription>
            </DialogHeader>

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      s === step
                        ? 'bg-white text-gray-900'
                        : s < step
                          ? 'bg-green-500 text-white'
                          : 'bg-white/30 text-white'
                    }`}
                  >
                    {s}
                  </div>
                  {s < totalSteps && (
                    <div
                      className={`w-12 h-1 mx-2 transition-colors ${
                        s < step ? 'bg-green-500' : 'bg-white/30'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleFormSubmit} onKeyDown={handleKeyDown} className="space-y-5">
              {/* Step 1: Background Image Selection */}
              {step === 1 && (
                <div className="space-y-2">
                  <Label className="text-white font-medium">Background Image</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {BACKGROUND_IMAGES.map((img) => (
                      <button
                        key={img}
                        type="button"
                        onClick={() => {
                          setForm((f) => ({ ...f, bg: img }));
                          if (errors.bg) setErrors((prev) => ({ ...prev, bg: undefined }));
                        }}
                        className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                          form.bg === img
                            ? 'border-white ring-2 ring-white'
                            : 'border-white/30 hover:border-white/60'
                        }`}
                      >
                        <img
                          src={`/${img}`}
                          alt={img}
                          className="w-full h-full object-cover"
                        />
                        {form.bg === img && (
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                              <div className="w-3 h-3 rounded-full bg-gray-900" />
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  {errors.bg && (
                    <p className="text-sm text-red-400 mt-1">{errors.bg}</p>
                  )}
                </div>
              )}

              {/* Step 2: Title, Price, and Description */}
              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-white font-medium">
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
                      className={`h-12 px-4 bg-white/90 transition-colors ${
                        errors.title
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:border-gray-900 focus:ring-gray-900'
                      }`}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-400 mt-1">{errors.title}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-white font-medium">
                      Price
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      min={0}
                      step="0.01"
                      value={form.price ?? 0}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        setForm((f) => ({ ...f, price: Number.isNaN(v) ? 0 : v }));
                        if (errors.price) setErrors((prev) => ({ ...prev, price: undefined }));
                      }}
                      placeholder="0.00"
                      className={`h-12 px-4 bg-white/90 transition-colors ${
                        errors.price
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:border-gray-900 focus:ring-gray-900'
                      }`}
                    />
                    {errors.price && (
                      <p className="text-sm text-red-400 mt-1">{errors.price}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-white font-medium">
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
                      className={`h-12 px-4 bg-white/90 transition-colors ${
                        errors.description
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:border-gray-900 focus:ring-gray-900'
                      }`}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-400 mt-1">{errors.description}</p>
                    )}
                  </div>
                </>
              )}

              {/* Step 3: Date, Time, Location, Capacity */}
              {step === 3 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-white font-medium">
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
                        className={`h-12 px-4 bg-white/90 transition-colors ${
                          errors.date
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:border-gray-900 focus:ring-gray-900'
                        }`}
                      />
                      {errors.date && (
                        <p className="text-sm text-red-400 mt-1">{errors.date}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time" className="text-white font-medium">
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
                        className={`h-12 px-4 bg-white/90 transition-colors ${
                          errors.time
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:border-gray-900 focus:ring-gray-900'
                        }`}
                      />
                      {errors.time && (
                        <p className="text-sm text-red-400 mt-1">{errors.time}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-white font-medium">
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
                      className={`h-12 px-4 bg-white/90 transition-colors ${
                        errors.location
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:border-gray-900 focus:ring-gray-900'
                      }`}
                    />
                    {errors.location && (
                      <p className="text-sm text-red-400 mt-1">{errors.location}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="capacity" className="text-white font-medium">
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
                      className={`h-12 px-4 bg-white/90 transition-colors ${
                        errors.capacity
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:border-gray-900 focus:ring-gray-900'
                      }`}
                    />
                    {errors.capacity && (
                      <p className="text-sm text-red-400 mt-1">{errors.capacity}</p>
                    )}
                  </div>
                </>
              )}

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                {step === 1 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="h-12 px-6 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-lg transition-all duration-300"
                  >
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : step === 2 ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevious}
                      className="h-12 px-6 bg-white hover:bg-gray-100 text-gray-900 border-gray-300"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="h-12 px-6 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-lg transition-all duration-300"
                    >
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevious}
                      className="h-12 px-6 bg-white hover:bg-gray-100 text-gray-900 border-gray-300"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSubmitClick}
                      disabled={saving}
                      className="h-12 px-6 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-lg transition-all duration-300"
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
                  </>
                )}
              </DialogFooter>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
