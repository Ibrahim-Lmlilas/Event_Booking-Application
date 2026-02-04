import { IsEnum } from 'class-validator';
import { EventStatus } from '../../common/enums/event-status.enum';

export class UpdateEventStatusDto {
  @IsEnum(EventStatus)
  status!: EventStatus;
}
