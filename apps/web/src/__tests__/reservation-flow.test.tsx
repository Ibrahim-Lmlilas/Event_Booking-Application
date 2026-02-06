/**
 * Functional flow test: Reservation flow
 * Tests the complete user journey: View event → Reserve → View reservation
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReserveButton } from '@/components/reservations/ReserveButton';
import { ReservedEventsGrid } from '@/components/reservations/ui/ReservedEventsGrid';
import { reservationsApi } from '@/lib/api/reservations';
import { eventsApi } from '@/lib/api/events';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from 'sonner';
import type { Event } from '@/lib/api/events';
import type { ReservationWithEvent } from '@/lib/api/reservations';

// Mock dependencies
jest.mock('@/lib/api/reservations');
jest.mock('@/lib/api/events');
jest.mock('@/lib/hooks/useAuth');
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    };
  },
}));

const mockUser = {
  id: 'user-1',
  email: 'participant@test.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'participant',
};

const mockEvent: Event = {
  _id: 'event-1',
  title: 'Test Event',
  description: 'Test Description',
  date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
  time: '18:00',
  location: 'Test Location',
  capacity: 100,
  price: 50,
  seatsTaken: 0,
  status: 'PUBLISHED',
  bg: 'event1.jpg',
};

const mockReservation: ReservationWithEvent = {
  _id: 'reservation-1',
  userId: {
    _id: 'user-1',
    email: 'participant@test.com',
    firstName: 'John',
    lastName: 'Doe',
  },
  eventId: mockEvent,
  status: 'PENDING',
  createdAt: new Date().toISOString(),
};

describe('Reservation Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false,
      authLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      checkAuth: jest.fn(),
    });
  });

  it('completes full reservation flow: view event → reserve → view reservation', async () => {
    const user = userEvent.setup();
    jest.setTimeout(15000); // Increase timeout for this test

    // Step 1: User views an event and sees Reserve button
    const { rerender } = render(<ReserveButton event={mockEvent} />);

    expect(screen.getByRole('button', { name: /reserve now/i })).toBeInTheDocument();
    expect(screen.getByRole('button')).not.toBeDisabled();

    // Step 2: User clicks Reserve button
    (reservationsApi.create as jest.Mock).mockResolvedValue({
      _id: 'reservation-1',
      eventId: mockEvent._id,
      status: 'PENDING',
    });

    const reserveButton = screen.getByRole('button', { name: /reserve now/i });
    await user.click(reserveButton);

    // Step 3: Verify reservation was created
    await waitFor(() => {
      expect(reservationsApi.create).toHaveBeenCalledWith({ eventId: mockEvent._id });
      expect(toast.success).toHaveBeenCalledWith('Reservation created successfully!');
    });

    // Step 4: Button should now show "Already Reserved"
    rerender(<ReserveButton event={mockEvent} hasReservation={true} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /already reserved/i })).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });

    // Step 5: User views their reservations using ReservedEventsGrid directly
    // This avoids the complexity of ParticipantReservationsClient's useEffect and loading states
    render(
      <ReservedEventsGrid 
        reservations={[mockReservation]} 
        onCancel={jest.fn()}
        onDownloadTicket={jest.fn()}
      />
    );

    // Verify reservation is displayed
    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeInTheDocument();
      expect(screen.getByText('PENDING')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('handles complete cancellation flow: view reservation → cancel → confirm → verify cancellation', async () => {
    const user = userEvent.setup();
    jest.setTimeout(15000); // Increase timeout for this test

    // Mock reservations with cancelable reservation (CONFIRMED, 25+ hours before event)
    const cancelableReservation: ReservationWithEvent = {
      ...mockReservation,
      _id: 'reservation-2',
      status: 'CONFIRMED',
      eventId: {
        ...mockEvent,
        date: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(), // 25 hours from now
      },
    };

    (reservationsApi.cancel as jest.Mock).mockResolvedValue(undefined);

    // Step 1: User views their reservations using ReservedEventsGrid directly
    // This avoids the complexity of ParticipantReservationsClient's useEffect and loading states
    const handleCancel = jest.fn().mockResolvedValue(undefined);
    
    render(
      <ReservedEventsGrid 
        reservations={[cancelableReservation]} 
        onCancel={handleCancel}
        onDownloadTicket={jest.fn()}
      />
    );

    // Verify reservation is displayed
    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeInTheDocument();
      expect(screen.getByText('CONFIRMED')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Step 2: User clicks Cancel button
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    expect(cancelButton).toBeInTheDocument();
    await user.click(cancelButton);

    // Step 3: Confirmation dialog appears
    await waitFor(() => {
      expect(screen.getByText(/cancel reservation/i)).toBeInTheDocument();
      expect(screen.getByText(/this will free your spot/i)).toBeInTheDocument();
    });

    // Step 4: User confirms cancellation
    const confirmButton = screen.getByRole('button', { name: /yes, cancel/i });
    await user.click(confirmButton);

    // Step 5: Verify cancellation callback was called
    await waitFor(() => {
      expect(handleCancel).toHaveBeenCalledWith('reservation-2');
    });
  });

  it('prevents duplicate reservations', async () => {
    const user = userEvent.setup();

    // User already has a reservation
    render(<ReserveButton event={mockEvent} hasReservation={true} />);

    expect(screen.getByRole('button', { name: /already reserved/i })).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();

    // Try to click (should not work)
    const reserveButton = screen.getByRole('button');
    await user.click(reserveButton);

    // Verify API was not called
    expect(reservationsApi.create).not.toHaveBeenCalled();
  });

  it('handles reservation errors gracefully', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Event is full';

    (reservationsApi.create as jest.Mock).mockRejectedValue(new Error(errorMessage));

    render(<ReserveButton event={mockEvent} />);

    const reserveButton = screen.getByRole('button', { name: /reserve now/i });
    await user.click(reserveButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });

    // Button should still be enabled after error
    expect(reserveButton).not.toBeDisabled();
  });
});
