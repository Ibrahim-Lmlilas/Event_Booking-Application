import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventsService } from './events.service';
import { Event, EventDocument } from './schemas/event.schema';
import { EventStatus } from '../common/enums/event-status.enum';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('EventsService', () => {
  let service: EventsService;
  let model: Model<EventDocument>;

  const mockEvent = {
    _id: '507f1f77bcf86cd799439011',
    title: 'Test Event',
    description: 'Test Description',
    date: new Date('2026-12-31'),
    time: '18:00',
    location: 'Test Location',
    capacity: 100,
    price: 50,
    seatsTaken: 0,
    status: EventStatus.DRAFT,
    bg: 'event1.jpg',
    save: jest.fn(),
    toObject: jest.fn(),
  };

  let mockSaveFn: jest.Mock;
  let mockToObjectFn: jest.Mock;

  const mockEventModel = jest.fn().mockImplementation((doc) => {
    mockSaveFn = jest.fn().mockResolvedValue({ ...mockEvent, ...doc });
    mockToObjectFn = jest.fn().mockReturnValue({ ...mockEvent, ...doc });
    return {
      ...mockEvent,
      ...doc,
      save: mockSaveFn,
      toObject: mockToObjectFn,
    };
  });

  Object.assign(mockEventModel, {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getModelToken(Event.name),
          useValue: mockEventModel,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    model = module.get<Model<EventDocument>>(getModelToken(Event.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an event with default DRAFT status', async () => {
      const createEventDto = {
        title: 'Test Event',
        description: 'Test Description',
        date: '2026-12-31',
        time: '18:00',
        location: 'Test Location',
        capacity: 100,
        price: 50,
        bg: 'event1.jpg',
      };

      const result = await service.create(createEventDto);

      expect(mockEventModel).toHaveBeenCalled();
      expect(mockSaveFn).toHaveBeenCalled();
      expect(result.status).toBe(EventStatus.DRAFT);
      expect(result.seatsTaken).toBe(0);
    });

    it('should create an event with specified status', async () => {
      const createEventDto = {
        title: 'Test Event',
        date: '2026-12-31',
        time: '18:00',
        location: 'Test Location',
        capacity: 100,
        price: 50,
        bg: 'event1.jpg',
        status: EventStatus.PUBLISHED,
      };

      const result = await service.create(createEventDto);

      expect(result.status).toBe(EventStatus.PUBLISHED);
      expect(mockEventModel).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated events', async () => {
      const mockEvents = [mockEvent];
      mockEventModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockEvents),
            }),
          }),
        }),
      });
      mockEventModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.findAll(1, 10);

      expect(result.events).toEqual(mockEvents);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should filter by status', async () => {
      mockEventModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });
      mockEventModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      await service.findAll(1, 10, EventStatus.PUBLISHED);

      expect(mockEventModel.find).toHaveBeenCalledWith({
        status: EventStatus.PUBLISHED,
      });
    });

    it('should filter by search term', async () => {
      mockEventModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });
      mockEventModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      await service.findAll(1, 10, undefined, 'test');

      expect(mockEventModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.arrayContaining([
            { title: { $regex: 'test', $options: 'i' } },
            { description: { $regex: 'test', $options: 'i' } },
            { location: { $regex: 'test', $options: 'i' } },
          ]),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return an event by id', async () => {
      mockEventModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockEvent),
      });

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockEvent);
      expect(mockEventModel.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.findOne('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if event not found', async () => {
      mockEventModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('507f1f77bcf86cd799439011')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update an event', async () => {
      const updateDto = { title: 'Updated Title' };
      const updatedEvent = { ...mockEvent, title: 'Updated Title' };

      mockEventModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedEvent),
      });

      const result = await service.update(
        '507f1f77bcf86cd799439011',
        updateDto,
      );

      expect(result.title).toBe('Updated Title');
      expect(mockEventModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        updateDto,
        { new: true },
      );
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.update('invalid-id', {})).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if event not found', async () => {
      mockEventModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.update('507f1f77bcf86cd799439011', {}),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete an event', async () => {
      mockEventModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockEvent),
      });

      const result = await service.remove('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockEvent);
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.remove('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if event not found', async () => {
      mockEventModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove('507f1f77bcf86cd799439011')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateStatus', () => {
    it('should update event status', async () => {
      const publishedEvent = { ...mockEvent, status: EventStatus.PUBLISHED };
      mockEventModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(publishedEvent),
      });

      const result = await service.updateStatus(
        '507f1f77bcf86cd799439011',
        EventStatus.PUBLISHED,
      );

      expect(result.status).toBe(EventStatus.PUBLISHED);
      expect(mockEventModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { status: EventStatus.PUBLISHED },
        { new: true },
      );
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(
        service.updateStatus('invalid-id', EventStatus.PUBLISHED),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if event not found', async () => {
      mockEventModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.updateStatus('507f1f77bcf86cd799439011', EventStatus.PUBLISHED),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
