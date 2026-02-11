import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReserveButton } from '../ReserveButton';
import { reservationsApi } from '@/lib/api/reservations';
import { toast } from 'sonner';
import type { IEvent } from '@/types';
import { EventStatus } from '@/types';

// Mock dependencies
jest.mock('@/lib/api/reservations');
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockEvent: IEvent = {
  _id: 'event-1',
  title: 'Test Event',
  description: 'Test Description',
  date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
  time: '18:00',
  location: 'Test Location',
  capacity: 100,
  price: 50,
  seatsTaken: 0,
  status: EventStatus.PUBLISHED,
  bg: 'event1.jpg',
};

describe('ReserveButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Reserve Now button for available event', () => {
    render(<ReserveButton event={mockEvent} />);

    expect(screen.getByRole('button', { name: /reserve now/i })).toBeInTheDocument();
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('displays Event Full when event is full', () => {
    const fullEvent = { ...mockEvent, seatsTaken: 100, capacity: 100 };
    render(<ReserveButton event={fullEvent} />);

    expect(screen.getByRole('button', { name: /event full/i })).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('displays Event Canceled when event is canceled', () => {
    const canceledEvent = { ...mockEvent, status: EventStatus.CANCELED };
    render(<ReserveButton event={canceledEvent} />);

    expect(screen.getByRole('button', { name: /event canceled/i })).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('displays Not Available when event is DRAFT', () => {
    const draftEvent = { ...mockEvent, status: EventStatus.DRAFT };
    render(<ReserveButton event={draftEvent} />);

    expect(screen.getByRole('button', { name: /not available/i })).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('displays Already Reserved when hasReservation is true', () => {
    render(<ReserveButton event={mockEvent} hasReservation={true} />);

    expect(screen.getByRole('button', { name: /already reserved/i })).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls reservationsApi.create on button click', async () => {
    const user = userEvent.setup();
    const onReservationSuccess = jest.fn();

    (reservationsApi.create as jest.Mock).mockResolvedValue({
      _id: 'reservation-1',
      eventId: mockEvent._id,
      status: 'PENDING',
    });

    render(<ReserveButton event={mockEvent} onReservationSuccess={onReservationSuccess} />);

    const reserveButton = screen.getByRole('button', { name: /reserve now/i });
    await user.click(reserveButton);

    await waitFor(() => {
      expect(reservationsApi.create).toHaveBeenCalledWith({ eventId: mockEvent._id });
      expect(toast.success).toHaveBeenCalledWith('Reservation created successfully!');
      expect(onReservationSuccess).toHaveBeenCalled();
    });
  });

  it('displays loading state during reservation', async () => {
    const user = userEvent.setup();
    let resolveCreate: (value: any) => void;
    const createPromise = new Promise(resolve => {
      resolveCreate = resolve;
    });

    (reservationsApi.create as jest.Mock).mockReturnValue(createPromise);

    render(<ReserveButton event={mockEvent} />);

    const reserveButton = screen.getByRole('button', { name: /reserve now/i });
    await user.click(reserveButton);

    expect(screen.getByText(/reserving/i)).toBeInTheDocument();
    expect(reserveButton).toBeDisabled();

    resolveCreate!({
      _id: 'reservation-1',
      eventId: mockEvent._id,
      status: 'PENDING',
    });

    await waitFor(() => {
      expect(screen.queryByText(/reserving/i)).not.toBeInTheDocument();
    });
  });

  it('displays error toast on reservation failure', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Event is full';

    (reservationsApi.create as jest.Mock).mockRejectedValue(new Error(errorMessage));

    render(<ReserveButton event={mockEvent} />);

    const reserveButton = screen.getByRole('button', { name: /reserve now/i });
    await user.click(reserveButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });
  });
});
