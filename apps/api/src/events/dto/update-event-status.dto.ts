import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { EventStatus } from '../../common/enums/event-status.enum.js';

export class UpdateEventStatusDto {
  @ApiProperty({ enum: EventStatus })
  @IsEnum(EventStatus)
  status!: EventStatus;
}
