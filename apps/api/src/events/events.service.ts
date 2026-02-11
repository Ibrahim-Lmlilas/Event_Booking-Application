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
import { EventStatus } from '../common/enums/event-status.enum.js';

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

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: EventStatus,
    search?: string,
    minPrice?: number,
    maxPrice?: number,
    date?: string,
    time?: string,
  ): Promise<{
    events: Event[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (status) query.status = status;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = minPrice;
      if (maxPrice !== undefined) query.price.$lte = maxPrice;
    }

    if (date) {
      const dateObj = new Date(date);
      const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
      const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    if (time) {
      query.time = { $regex: `^${time}`, $options: 'i' };
    }

    const [events, total] = await Promise.all([
      this.eventModel
        .find(query)
        .sort({ date: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.eventModel.countDocuments(query).exec(),
    ]);
    return {
      events,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
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
