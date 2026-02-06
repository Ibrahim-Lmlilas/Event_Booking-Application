import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReservedEventsGrid } from '../ReservedEventsGrid';
import type { ReservationWithEvent } from '@/lib/api/reservations';
import type { Event } from '@/lib/api/events';

const mockEvent: Event = {
  _id: 'event-1',
  title: 'Test Event',
  description: 'Test Description',
  date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
  time: '18:00',
  location: 'Test Location',
  capacity: 100,
  price: 50,
  seatsTaken: 10,
  status: 'PUBLISHED',
  bg: 'event1.jpg',
};

const mockReservation: ReservationWithEvent = {
  _id: 'reservation-1',
  userId: {
    _id: 'user-1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
  },
  eventId: mockEvent,
  status: 'PENDING',
  createdAt: new Date().toISOString(),
};

const mockConfirmedReservation: ReservationWithEvent = {
  ...mockReservation,
  _id: 'reservation-2',
  status: 'CONFIRMED',
  eventId: {
    ...mockEvent,
    date: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(), // 25 hours from now
  },
};

describe('ReservedEventsGrid', () => {
  it('renders reservations correctly', () => {
    render(<ReservedEventsGrid reservations={[mockReservation]} />);

    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Test Location')).toBeInTheDocument();
  });

  it('displays reservation status badge', () => {
    render(<ReservedEventsGrid reservations={[mockReservation]} />);

    expect(screen.getByText('PENDING')).toBeInTheDocument();
  });

  it('shows Download button for CONFIRMED reservations', () => {
    render(<ReservedEventsGrid reservations={[mockConfirmedReservation]} />);

    expect(screen.getByRole('button', { name: /download/i })).toBeInTheDocument();
  });

  it('does not show Download button for PENDING reservations', () => {
    render(<ReservedEventsGrid reservations={[mockReservation]} />);

    expect(screen.queryByRole('button', { name: /download/i })).not.toBeInTheDocument();
  });

  it('shows Cancel button for cancelable reservations', () => {
    render(<ReservedEventsGrid reservations={[mockConfirmedReservation]} />);

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('calls onDownloadTicket when Download button is clicked', async () => {
    const user = userEvent.setup();
    const onDownloadTicket = jest.fn().mockResolvedValue(undefined);

    render(
      <ReservedEventsGrid
        reservations={[mockConfirmedReservation]}
        onDownloadTicket={onDownloadTicket}
      />,
    );

    const downloadButton = screen.getByRole('button', { name: /download/i });
    await user.click(downloadButton);

    await waitFor(() => {
      expect(onDownloadTicket).toHaveBeenCalledWith('reservation-2');
    });
  });

  it('opens confirmation dialog when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn().mockResolvedValue(undefined);

    render(<ReservedEventsGrid reservations={[mockConfirmedReservation]} onCancel={onCancel} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.getByText(/cancel reservation/i)).toBeInTheDocument();
      expect(screen.getByText(/this will free your spot/i)).toBeInTheDocument();
      expect(screen.getByText(/keep/i)).toBeInTheDocument();
    });
  });

  it('calls onCancel when user confirms cancellation', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn().mockResolvedValue(undefined);

    render(<ReservedEventsGrid reservations={[mockConfirmedReservation]} onCancel={onCancel} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.getByText(/cancel reservation/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /yes, cancel/i });
    expect(confirmButton).toBeInTheDocument();
    await user.click(confirmButton);

    await waitFor(() => {
      expect(onCancel).toHaveBeenCalledWith('reservation-2');
    });
  });

  it('does not show Cancel button for non-cancelable reservations', () => {
    const pastEventReservation: ReservationWithEvent = {
      ...mockReservation,
      eventId: {
        ...mockEvent,
        date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      },
    };

    render(<ReservedEventsGrid reservations={[pastEventReservation]} />);

    expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
  });

  it('displays event date and time correctly', () => {
    render(<ReservedEventsGrid reservations={[mockReservation]} />);

    // The time is displayed along with the date, so we check for a partial match
    expect(screen.getByText(new RegExp(mockEvent.time))).toBeInTheDocument();
  });

  it('displays reserved date correctly', () => {
    render(<ReservedEventsGrid reservations={[mockReservation]} />);

    const reservedDate = new Date(mockReservation.createdAt!).toLocaleDateString();
    const reservedText = screen.getByText(/reserved on/i);
    expect(reservedText).toBeInTheDocument();
    expect(reservedText.textContent).toContain(reservedDate);
  });
});
