import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  IsEnum,
  IsDateString,
  MinLength,
} from 'class-validator';
import { EventStatus } from '../../common/enums/event-status.enum.js';

export class CreateEventDto {
  @ApiProperty({ example: 'Tech Conference 2026' })
  @IsString()
  @MinLength(1, { message: 'Title is required' })
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2026-03-15' })
  @IsDateString()
  date!: string;

  @ApiProperty({ example: '14:00' })
  @IsString()
  @MinLength(1, { message: 'Time is required' })
  time!: string;

  @ApiProperty({ example: 'Grand Hall, Casablanca' })
  @IsString()
  @MinLength(1, { message: 'Location is required' })
  location!: string;

  @ApiProperty({ example: 100, minimum: 1 })
  @IsNumber()
  @Min(1, { message: 'Capacity must be at least 1' })
  capacity!: number;

  @ApiProperty({ example: 50, minimum: 0 })
  @IsNumber()
  @Min(0, { message: 'Price must be at least 0' })
  price!: number;

  @ApiPropertyOptional({ enum: EventStatus })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiProperty({ description: 'Background image URL or base64' })
  @IsString()
  @MinLength(1, { message: 'Background image is required' })
  bg!: string;
}
