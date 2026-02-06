import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reservation, ReservationDocument } from './schemas/reservation.schema';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';
import { EventsService } from '../events/events.service';
import { EventStatus } from '../common/enums/event-status.enum';
import { ReservationStatus } from '../common/enums/reservation-status.enum';
import { CANCEL_MIN_HOURS_BEFORE_EVENT } from './constants/cancellation-rules';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectModel(Reservation.name)
    private reservationModel: Model<ReservationDocument>,
    private eventsService: EventsService,
  ) {}

  async create(createReservationDto: CreateReservationDto, userId: string) {
    const eventId = createReservationDto.eventId;

    // Validate event ID
    if (!Types.ObjectId.isValid(eventId)) {
      throw new BadRequestException('Invalid event ID');
    }

    // Get event and validate it exists
    let event;
    try {
      event = await this.eventsService.findOne(eventId);
    } catch (error) {
      throw new NotFoundException('Event not found');
    }

    // Rule 1: Cannot reserve DRAFT event
    if (event.status === EventStatus.DRAFT) {
      throw new BadRequestException('Cannot reserve a DRAFT event');
    }

    // Rule 2: Cannot reserve CANCELED event
    if (event.status === EventStatus.CANCELED) {
      throw new BadRequestException('Cannot reserve a canceled event');
    }

    // Rule 3: Event must not be full
    if (event.seatsTaken >= event.capacity) {
      throw new BadRequestException('Event is full');
    }

    // Check if user already has a reservation for this event
    const existingReservation = await this.reservationModel
      .findOne({
        userId: new Types.ObjectId(userId),
        eventId: new Types.ObjectId(eventId),
      })
      .exec();

    if (existingReservation) {
      throw new ConflictException(
        'You already have a reservation for this event',
      );
    }

    // Create reservation
    const reservation = new this.reservationModel({
      userId: new Types.ObjectId(userId),
      eventId: new Types.ObjectId(eventId),
    });

    const savedReservation = await reservation.save();

    // Update event seatsTaken (reservation is created with PENDING status, so we increment)
    // When confirmed, no change needed. When refused/canceled, we'll decrement in updateStatus
    await this.eventsService.update(eventId, {
      seatsTaken: event.seatsTaken + 1,
    });

    // Populate and return plain object to avoid serialization issues
    await savedReservation.populate('eventId');
    return savedReservation.toObject();
  }

  async findAllByUser(userId: string) {
    try {
      const reservations = await this.reservationModel
        .find({ userId: new Types.ObjectId(userId) })
        .populate('eventId')
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      return reservations || [];
    } catch (error) {
      throw new BadRequestException('Failed to fetch reservations');
    }
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid reservation ID');
    }
    const reservation = await this.reservationModel
      .findById(id)
      .populate('eventId')
      .lean()
      .exec();
    if (!reservation) {
      throw new NotFoundException(`Reservation #${id} not found`);
    }
    return reservation;
  }

  async update(id: string, updateReservationDto: UpdateReservationDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid reservation ID');
    }
    const reservation = await this.reservationModel
      .findByIdAndUpdate(id, updateReservationDto, { new: true })
      .populate('eventId')
      .lean()
      .exec();
    if (!reservation) {
      throw new NotFoundException(`Reservation #${id} not found`);
    }
    return reservation;
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid reservation ID');
    }
    const reservation = await this.reservationModel
      .findByIdAndDelete(id)
      .lean()
      .exec();
    if (!reservation) {
      throw new NotFoundException(`Reservation #${id} not found`);
    }
    return reservation;
  }

  async findAll(filters?: {
    eventTitle?: string;
    userName?: string;
    status?: ReservationStatus;
  }) {
    try {
      const query: any = {};

      if (filters?.status) {
        query.status = filters.status;
      }

      let reservations = await this.reservationModel
        .find(query)
        .populate('eventId')
        .populate('userId')
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      // Filter by event title if provided
      if (filters?.eventTitle) {
        const eventTitleLower = filters.eventTitle.toLowerCase();
        reservations = reservations.filter((r: any) => {
          const event = r.eventId;
          if (!event || typeof event !== 'object') return false;
          return event.title?.toLowerCase().includes(eventTitleLower);
        });
      }

      // Filter by user name (firstName or lastName) if provided
      if (filters?.userName) {
        const userNameLower = filters.userName.toLowerCase();
        reservations = reservations.filter((r: any) => {
          const user = r.userId;
          if (!user || typeof user !== 'object') return false;
          const firstName = user.firstName?.toLowerCase() || '';
          const lastName = user.lastName?.toLowerCase() || '';
          return (
            firstName.includes(userNameLower) ||
            lastName.includes(userNameLower)
          );
        });
      }

      return reservations || [];
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch reservations');
    }
  }

  /**
   * EBA-113 / EBA-115 / EBA-116: Participant cancels own reservation.
   * Rules (EBA-112): only owner, only PENDING/CONFIRMED, event must be at least 24h in future.
   * Updates status to CANCELED and frees capacity via updateStatus.
   */
  async cancelByParticipant(id: string, userId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid reservation ID');
    }

    const reservation = await this.reservationModel.findById(id).exec();
    if (!reservation) {
      throw new NotFoundException(`Reservation #${id} not found`);
    }

    if (reservation.userId.toString() !== userId) {
      throw new ForbiddenException('You can only cancel your own reservation');
    }

    if (
      reservation.status !== ReservationStatus.PENDING &&
      reservation.status !== ReservationStatus.CONFIRMED
    ) {
      throw new BadRequestException(
        'Only PENDING or CONFIRMED reservations can be canceled',
      );
    }

    const eventId = reservation.eventId.toString();
    const event = await this.eventsService.findOne(eventId);
    const eventStart = this.getEventStartDate(event);
    const now = new Date();
    const minCancelTime = new Date(
      now.getTime() + CANCEL_MIN_HOURS_BEFORE_EVENT * 60 * 60 * 1000,
    );
    if (eventStart < minCancelTime) {
      throw new BadRequestException(
        `Cancellation is only allowed at least ${CANCEL_MIN_HOURS_BEFORE_EVENT} hours before the event starts`,
      );
    }

    return this.updateStatus(id, { status: ReservationStatus.CANCELED });
  }

  private getEventStartDate(event: { date: Date; time?: string }): Date {
    const d = new Date(event.date);
    const time = event.time || '00:00';
    const [hours, minutes] = time.split(':').map((s) => parseInt(s, 10) || 0);
    d.setHours(hours, minutes, 0, 0);
    return d;
  }

  async updateStatus(id: string, updateStatusDto: UpdateReservationStatusDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid reservation ID');
    }

    const reservation = await this.reservationModel.findById(id).exec();
    if (!reservation) {
      throw new NotFoundException(`Reservation #${id} not found`);
    }

    const oldStatus = reservation.status;
    const newStatus = updateStatusDto.status;

    // Update reservation status
    reservation.status = newStatus;
    await reservation.save();

    const eventId = reservation.eventId.toString();
    const event = await this.eventsService.findOne(eventId);

    // Handle seatsTaken changes based on status transitions
    // Note: When reservation is created, seatsTaken is already incremented
    if (oldStatus === newStatus) {
      // No change needed
      await reservation.populate('eventId');
      await reservation.populate('userId');
      return reservation.toObject();
    }

    // CONFIRMED -> REFUSED/CANCELED: decrement seatsTaken
    if (
      oldStatus === ReservationStatus.CONFIRMED &&
      (newStatus === ReservationStatus.REFUSED ||
        newStatus === ReservationStatus.CANCELED)
    ) {
      if (event && event.seatsTaken > 0) {
        await this.eventsService.update(eventId, {
          seatsTaken: event.seatsTaken - 1,
        });
      }
    }

    // PENDING -> REFUSED/CANCELED: decrement seatsTaken (was incremented on creation)
    if (
      oldStatus === ReservationStatus.PENDING &&
      (newStatus === ReservationStatus.REFUSED ||
        newStatus === ReservationStatus.CANCELED)
    ) {
      if (event && event.seatsTaken > 0) {
        await this.eventsService.update(eventId, {
          seatsTaken: event.seatsTaken - 1,
        });
      }
    }

    // REFUSED/CANCELED -> CONFIRMED: increment seatsTaken
    if (
      (oldStatus === ReservationStatus.REFUSED ||
        oldStatus === ReservationStatus.CANCELED) &&
      newStatus === ReservationStatus.CONFIRMED
    ) {
      if (event) {
        await this.eventsService.update(eventId, {
          seatsTaken: event.seatsTaken + 1,
        });
      }
    }

    // PENDING -> CONFIRMED: no change (already counted on creation)
    // REFUSED/CANCELED -> REFUSED/CANCELED: no change

    await reservation.populate('eventId');
    await reservation.populate('userId');
    return reservation.toObject();
  }
}
