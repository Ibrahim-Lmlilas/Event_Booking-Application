import { IsEnum, IsNotEmpty } from 'class-validator';
import { ReservationStatus } from '../../common/enums/reservation-status.enum';

export class UpdateReservationStatusDto {
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(ReservationStatus, { message: 'Invalid reservation status' })
  status!: ReservationStatus;
}
