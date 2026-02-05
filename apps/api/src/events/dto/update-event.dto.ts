import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsNumber, Min } from 'class-validator';
import { CreateEventDto } from './create-event.dto';

export class UpdateEventDto extends PartialType(CreateEventDto) {
  @IsOptional()
  @IsNumber()
  @Min(0)
  seatsTaken?: number;
}
