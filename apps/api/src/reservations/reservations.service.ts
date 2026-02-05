import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reservation, ReservationDocument } from './schemas/reservation.schema';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { EventsService } from '../events/events.service';
import { EventStatus } from '../common/enums/event-status.enum';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectModel(Reservation.name) private reservationModel: Model<ReservationDocument>,
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
      throw new ConflictException('You already have a reservation for this event');
    }

    // Create reservation
    const reservation = new this.reservationModel({
      userId: new Types.ObjectId(userId),
      eventId: new Types.ObjectId(eventId),
    });

    const savedReservation = await reservation.save();

    // Update event seatsTaken
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
    const reservation = await this.reservationModel.findById(id).populate('eventId').lean().exec();
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
    const reservation = await this.reservationModel.findByIdAndDelete(id).lean().exec();
    if (!reservation) {
      throw new NotFoundException(`Reservation #${id} not found`);
    }
    return reservation;
  }
}
