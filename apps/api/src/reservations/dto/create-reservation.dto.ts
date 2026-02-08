import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateReservationDto {
  @ApiProperty({ description: 'MongoDB ObjectId of the event' })
  @IsNotEmpty({ message: 'Event ID is required' })
  @IsMongoId({ message: 'Invalid event ID' })
  eventId!: string;
}
