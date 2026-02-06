import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ParticipantEventsGrid } from '../ParticipantEventsGrid';
import type { Event } from '@/lib/api/events';
import type { ReservationWithEvent } from '@/lib/api/reservations';
import { reservationsApi } from '@/lib/api/reservations';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('@/lib/api/reservations');
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockEvent1: Event = {
  _id: 'event-1',
  title: 'Test Event 1',
  description: 'Test Description 1',
  date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
  time: '18:00',
  location: 'Test Location 1',
  capacity: 100,
  price: 50,
  seatsTaken: 10,
  status: 'PUBLISHED',
  bg: 'event1.jpg',
};

const mockEvent2: Event = {
  _id: 'event-2',
  title: 'Test Event 2',
  description: 'Test Description 2',
  date: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
  time: '19:00',
  location: 'Test Location 2',
  capacity: 50,
  price: 75,
  seatsTaken: 50,
  status: 'PUBLISHED',
  bg: 'event2.jpg',
};

const mockReservation: ReservationWithEvent = {
  _id: 'reservation-1',
  userId: {
    _id: 'user-1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
  },
  eventId: mockEvent1,
  status: 'PENDING',
  createdAt: new Date().toISOString(),
};

describe('ParticipantEventsGrid', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders events grid correctly', () => {
    render(<ParticipantEventsGrid events={[mockEvent1, mockEvent2]} />);

    expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    expect(screen.getByText('Test Event 2')).toBeInTheDocument();
    expect(screen.getByText('Test Description 1')).toBeInTheDocument();
    expect(screen.getByText('Test Description 2')).toBeInTheDocument();
  });

  it('displays event details correctly', () => {
    render(<ParticipantEventsGrid events={[mockEvent1]} />);

    expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    expect(screen.getByText('Test Location 1')).toBeInTheDocument();
    expect(screen.getByText(/10 \/ 100/)).toBeInTheDocument(); // seatsTaken / capacity
    expect(screen.getByText(/50\.00/)).toBeInTheDocument(); // price
  });

  it('displays Reserve Now button for available events', () => {
    render(<ParticipantEventsGrid events={[mockEvent1]} />);

    expect(screen.getByRole('button', { name: /reserve now/i })).toBeInTheDocument();
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('displays Already Reserved when user has reservation', () => {
    render(
      <ParticipantEventsGrid events={[mockEvent1]} reservations={[mockReservation]} />,
    );

    expect(screen.getByRole('button', { name: /already reserved/i })).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('displays Event Full when event is full', () => {
    render(<ParticipantEventsGrid events={[mockEvent2]} />);

    expect(screen.getByRole('button', { name: /event full/i })).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls onReservationSuccess callback when reservation is created', async () => {
    const user = userEvent.setup();
    const onReservationSuccess = jest.fn();

    (reservationsApi.create as jest.Mock).mockResolvedValue({
      _id: 'reservation-2',
      eventId: mockEvent1._id,
      status: 'PENDING',
    });

    render(
      <ParticipantEventsGrid
        events={[mockEvent1]}
        onReservationSuccess={onReservationSuccess}
      />,
    );

    const reserveButton = screen.getByRole('button', { name: /reserve now/i });
    await user.click(reserveButton);

    await waitFor(() => {
      expect(reservationsApi.create).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Reservation created successfully!');
      expect(onReservationSuccess).toHaveBeenCalled();
    });
  });

  it('formats date correctly', () => {
    render(<ParticipantEventsGrid events={[mockEvent1]} />);

    const dateText = screen.getByText(new RegExp(mockEvent1.time));
    expect(dateText).toBeInTheDocument();
  });

  it('handles events with no description', () => {
    const eventWithoutDescription = { ...mockEvent1, description: undefined };
    render(<ParticipantEventsGrid events={[eventWithoutDescription]} />);

    expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Description 1')).not.toBeInTheDocument();
  });

  it('renders empty state when no events', () => {
    render(<ParticipantEventsGrid events={[]} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
