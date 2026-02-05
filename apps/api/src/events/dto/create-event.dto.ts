import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  IsEnum,
  IsDateString,
  MinLength,
} from 'class-validator';
import { EventStatus } from '../../common/enums/event-status.enum';

export class CreateEventDto {
  @IsString()
  @MinLength(1, { message: 'Title is required' })
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  date!: string;

  @IsString()
  @MinLength(1, { message: 'Time is required' })
  time!: string;

  @IsString()
  @MinLength(1, { message: 'Location is required' })
  location!: string;

  @IsNumber()
  @Min(1, { message: 'Capacity must be at least 1' })
  capacity!: number;

  @IsNumber()
  @Min(0, { message: 'Price must be at least 0' })
  price!: number;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @IsString()
  @MinLength(1, { message: 'Background image is required' })
  bg!: string;
}
