import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event, EventDocument } from './schemas/event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventStatus } from '../common/enums/event-status.enum';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
  ) {}

  async create(createEventDto: CreateEventDto) {
    const doc = {
      ...createEventDto,
      date: new Date(createEventDto.date),
      seatsTaken: 0,
      status: createEventDto.status ?? EventStatus.DRAFT,
    };
    const event = new this.eventModel(doc);
    await event.save();
    return event;
  }

  async findAll(): Promise<Event[]> {
    return this.eventModel.find().sort({ date: 1 }).exec();
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid event id');
    }
    const event = await this.eventModel.findById(id).exec();
    if (!event) {
      throw new NotFoundException(`Event #${id} not found`);
    }
    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid event id');
    }
    const payload = { ...updateEventDto } as any;
    if (payload.date) {
      payload.date = new Date(payload.date);
    }
    const event = await this.eventModel
      .findByIdAndUpdate(id, payload, { new: true })
      .exec();
    if (!event) {
      throw new NotFoundException(`Event #${id} not found`);
    }
    return event;
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid event id');
    }
    const result = await this.eventModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Event #${id} not found`);
    }
    return result;
  }

  async updateStatus(id: string, status: EventStatus) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid event id');
    }
    const event = await this.eventModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();
    if (!event) {
      throw new NotFoundException(`Event #${id} not found`);
    }
    return event;
  }
}
