import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ReservationStatus } from '../../common/enums/reservation-status.enum.js';

export class UpdateReservationStatusDto {
  @ApiProperty({ enum: ReservationStatus })
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(ReservationStatus, { message: 'Invalid reservation status' })
  status!: ReservationStatus;
}
