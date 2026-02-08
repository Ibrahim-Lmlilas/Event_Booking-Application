import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  Res,
  StreamableFile,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ReservationsService } from './reservations.service';
import { TicketsService } from '../tickets/tickets.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum.js';
import { ReservationStatus } from '../common/enums/reservation-status.enum.js';
import type { Response } from 'express';

@ApiTags('reservations')
@Controller('reservations')
export class ReservationsController {
  constructor(
    private readonly reservationsService: ReservationsService,
    private readonly ticketsService: TicketsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a reservation' })
  @ApiResponse({ status: 201, description: 'Reservation created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @Body() createReservationDto: CreateReservationDto,
    @Request() req: any,
  ) {
    return this.reservationsService.create(
      createReservationDto,
      req.user._id.toString(),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List reservations (Admin: all with filters, Participant: own)' })
  @ApiQuery({ name: 'eventTitle', required: false })
  @ApiQuery({ name: 'userName', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ReservationStatus })
  @ApiResponse({ status: 200 })
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
  @Get(':id/ticket')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Download ticket PDF (CONFIRMED only, own only)' })
  @ApiResponse({ status: 200, description: 'PDF file' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getTicket(
    @Param('id') id: string,
    @Request() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.user._id.toString();
    const reservation = await this.reservationsService.findOne(id);
    const resAny = reservation as any;
    if (resAny.userId?.toString?.() !== userId) {
      throw new ForbiddenException('You can only download your own ticket');
    }
    if (reservation.status !== ReservationStatus.CONFIRMED) {
      throw new BadRequestException(
        'Ticket download is only available for CONFIRMED reservations',
      );
    }
    const event = resAny.eventId;
    if (!event || typeof event !== 'object') {
      throw new NotFoundException('Event not found');
    }
    const participantName =
      req.user?.firstName && req.user?.lastName
        ? `${req.user.firstName} ${req.user.lastName}`
        : 'Participant';
    const ticketData = {
      eventTitle: event.title || 'Event',
      eventDescription: event.description || '',
      eventLocation: event.location || '',
      eventDate: event.date ? new Date(event.date) : null,
      eventTime: event.time || '',
      eventPrice: event.price ?? 0,
      participantName,
      ticketNumber: resAny._id?.toString?.()?.slice(-10) || 'N/A',
    };
    const buffer = await this.ticketsService.generatePdfBuffer(ticketData);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="ticket-${id}.pdf"`,
    });
    return new StreamableFile(buffer);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get reservation by ID' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(@Param('id') id: string) {
    return this.reservationsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update reservation' })
  @ApiResponse({ status: 200 })
  update(
    @Param('id') id: string,
    @Body() updateReservationDto: UpdateReservationDto,
  ) {
    return this.reservationsService.update(id, updateReservationDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update reservation status (Admin only)' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateReservationStatusDto,
  ) {
    return this.reservationsService.updateStatus(id, updateStatusDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel own reservation (min 24h before event)' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 400, description: 'Too late to cancel' })
  cancel(@Param('id') id: string, @Request() req: any) {
    return this.reservationsService.cancelByParticipant(
      id,
      req.user._id.toString(),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete reservation' })
  @ApiResponse({ status: 200 })
  remove(@Param('id') id: string) {
    return this.reservationsService.remove(id);
  }
}
