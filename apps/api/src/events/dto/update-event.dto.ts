import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min } from 'class-validator';
import { CreateEventDto } from './create-event.dto';

export class UpdateEventDto extends PartialType(CreateEventDto) {
  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  seatsTaken?: number;
}
