import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { ReservationStatus } from '../common/enums/reservation-status.enum';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createReservationDto: CreateReservationDto, @Request() req: any) {
    return this.reservationsService.create(createReservationDto, req.user._id.toString());
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Request() req: any,
    @Query('eventTitle') eventTitle?: string,
    @Query('userName') userName?: string,
    @Query('status') status?: ReservationStatus,
  ) {
    // Admin can see all reservations with filters
    // Participant can only see their own
    const userRole = req.user?.role?.toLowerCase();
    if (userRole === 'admin') {
      return this.reservationsService.findAll({ eventTitle, userName, status });
    }
    return this.reservationsService.findAllByUser(req.user._id.toString());
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reservationsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReservationDto: UpdateReservationDto) {
    return this.reservationsService.update(id, updateReservationDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateReservationStatusDto) {
    return this.reservationsService.updateStatus(id, updateStatusDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reservationsService.remove(id);
  }
}
