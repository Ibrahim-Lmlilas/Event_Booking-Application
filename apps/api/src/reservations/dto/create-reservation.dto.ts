import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateReservationDto {
  @IsNotEmpty({ message: 'Event ID is required' })
  @IsMongoId({ message: 'Invalid event ID' })
  eventId!: string;
}
