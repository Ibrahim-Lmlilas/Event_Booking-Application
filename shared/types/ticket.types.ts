export interface ITicketData {
  eventTitle: string;
  eventDescription?: string;
  eventLocation: string;
  eventDate: Date | null;
  eventTime: string;
  eventPrice?: number;
  participantName: string;
  ticketNumber: string;
}
