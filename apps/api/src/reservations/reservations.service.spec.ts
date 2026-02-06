import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ReservationsService } from './reservations.service';
import { EventsService } from '../events/events.service';
import { Reservation, ReservationDocument } from './schemas/reservation.schema';
import { EventStatus } from '../common/enums/event-status.enum';
import { ReservationStatus } from '../common/enums/reservation-status.enum';
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let reservationModel: Model<ReservationDocument>;
  let eventsService: EventsService;

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
    status: EventStatus.PUBLISHED,
    bg: 'event1.jpg',
  };

  const mockReservation = {
    _id: '507f1f77bcf86cd799439012',
    userId: '507f1f77bcf86cd799439013',
    eventId: mockEvent._id,
    status: ReservationStatus.PENDING,
    populate: jest.fn(),
    save: jest.fn(),
    toObject: jest.fn().mockReturnValue({
      _id: '507f1f77bcf86cd799439012',
      userId: '507f1f77bcf86cd799439013',
      eventId: mockEvent,
      status: ReservationStatus.PENDING,
    }),
  };

  const mockReservationModel = jest.fn().mockImplementation((doc) => {
    return {
      ...mockReservation,
      ...doc,
      populate: jest.fn().mockResolvedValue({ ...mockReservation, ...doc }),
      save: jest.fn().mockResolvedValue({ ...mockReservation, ...doc }),
      toObject: jest.fn().mockReturnValue({ ...mockReservation, ...doc }),
    };
  });

  Object.assign(mockReservationModel, {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  });

  const mockEventsService = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: getModelToken(Reservation.name),
          useValue: mockReservationModel,
        },
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    reservationModel = module.get<Model<ReservationDocument>>(
      getModelToken(Reservation.name),
    );
    eventsService = module.get<EventsService>(EventsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const userId = '507f1f77bcf86cd799439013';
    const createDto = { eventId: mockEvent._id };

    it('should create a reservation for a published event', async () => {
      mockEventsService.findOne.mockResolvedValue(mockEvent);
      mockReservationModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      mockEventsService.update.mockResolvedValue({
        ...mockEvent,
        seatsTaken: 1,
      });

      const result = await service.create(createDto, userId);

      expect(mockEventsService.findOne).toHaveBeenCalledWith(mockEvent._id);
      expect(mockReservationModel.findOne).toHaveBeenCalled();
      expect(mockReservationModel).toHaveBeenCalled();
      expect(mockEventsService.update).toHaveBeenCalledWith(mockEvent._id, {
        seatsTaken: 1,
      });
    });

    it('should throw BadRequestException for DRAFT event', async () => {
      const draftEvent = { ...mockEvent, status: EventStatus.DRAFT };
      mockEventsService.findOne.mockResolvedValue(draftEvent);

      await expect(service.create(createDto, userId)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockEventsService.findOne).toHaveBeenCalled();
    });

    it('should throw BadRequestException for CANCELED event', async () => {
      const canceledEvent = { ...mockEvent, status: EventStatus.CANCELED };
      mockEventsService.findOne.mockResolvedValue(canceledEvent);

      await expect(service.create(createDto, userId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when event is full', async () => {
      const fullEvent = { ...mockEvent, seatsTaken: 100, capacity: 100 };
      mockEventsService.findOne.mockResolvedValue(fullEvent);

      await expect(service.create(createDto, userId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException for duplicate reservation', async () => {
      mockEventsService.findOne.mockResolvedValue(mockEvent);
      mockReservationModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockReservation),
      });

      await expect(service.create(createDto, userId)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException for invalid event ID', async () => {
      await expect(
        service.create({ eventId: 'invalid' }, userId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when event does not exist', async () => {
      mockEventsService.findOne.mockRejectedValue(
        new NotFoundException('Event not found'),
      );

      await expect(service.create(createDto, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAllByUser', () => {
    const userId = '507f1f77bcf86cd799439013';

    it('should return user reservations', async () => {
      const reservations = [mockReservation];
      mockReservationModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(reservations),
            }),
          }),
        }),
      });

      const result = await service.findAllByUser(userId);

      expect(result).toEqual(reservations);
      expect(mockReservationModel.find).toHaveBeenCalledWith({
        userId: expect.any(Object),
      });
    });

    it('should return empty array if no reservations', async () => {
      mockReservationModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });

      const result = await service.findAllByUser(userId);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a reservation by id', async () => {
      mockReservationModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockReservation),
          }),
        }),
      });

      const result = await service.findOne('507f1f77bcf86cd799439012');

      expect(result).toEqual(mockReservation);
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.findOne('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if reservation not found', async () => {
      mockReservationModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
          }),
        }),
      });

      await expect(service.findOne('507f1f77bcf86cd799439012')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('cancelByParticipant', () => {
    const userId = '507f1f77bcf86cd799439013';
    const reservationId = '507f1f77bcf86cd799439012';

    it('should cancel a PENDING reservation', async () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 25);
      const futureEvent = {
        ...mockEvent,
        date: futureDate,
        time: '18:00',
      };

      const pendingReservation = {
        ...mockReservation,
        status: ReservationStatus.PENDING,
        userId: { toString: () => userId },
        eventId: { toString: () => mockEvent._id },
      };

      const reservationDoc = {
        ...pendingReservation,
        save: jest.fn().mockResolvedValue(pendingReservation),
        populate: jest.fn().mockResolvedValue(pendingReservation),
        toObject: jest.fn().mockReturnValue(pendingReservation),
      };

      mockReservationModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(reservationDoc),
      });
      mockEventsService.findOne.mockResolvedValue(futureEvent);

      // Mock updateStatus method to return canceled reservation
      const canceledReservationDoc = {
        ...pendingReservation,
        status: ReservationStatus.CANCELED,
        populate: jest.fn().mockResolvedValue({
          ...pendingReservation,
          status: ReservationStatus.CANCELED,
        }),
        toObject: jest.fn().mockReturnValue({
          ...pendingReservation,
          status: ReservationStatus.CANCELED,
        }),
      };

      mockReservationModel.findById
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue(reservationDoc),
        })
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue(canceledReservationDoc),
        });

      mockEventsService.update.mockResolvedValue(futureEvent);

      const result = await service.cancelByParticipant(reservationId, userId);

      expect(result.status).toBe(ReservationStatus.CANCELED);
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      const otherUserReservation = {
        ...mockReservation,
        userId: { toString: () => 'other-user-id' },
      };

      mockReservationModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(otherUserReservation),
      });

      await expect(
        service.cancelByParticipant(reservationId, userId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if reservation is not PENDING or CONFIRMED', async () => {
      const refusedReservation = {
        ...mockReservation,
        status: ReservationStatus.REFUSED,
        userId: { toString: () => userId },
      };

      mockReservationModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(refusedReservation),
      });

      await expect(
        service.cancelByParticipant(reservationId, userId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateStatus', () => {
    const reservationId = '507f1f77bcf86cd799439012';

    it('should update status from PENDING to CONFIRMED', async () => {
      const pendingReservation = {
        ...mockReservation,
        status: ReservationStatus.PENDING,
        eventId: { toString: () => mockEvent._id },
      };

      mockReservationModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(pendingReservation),
      });
      pendingReservation.save = jest.fn().mockResolvedValue(pendingReservation);
      mockEventsService.findOne.mockResolvedValue(mockEvent);
      pendingReservation.populate = jest
        .fn()
        .mockResolvedValue(pendingReservation);

      const result = await service.updateStatus(reservationId, {
        status: ReservationStatus.CONFIRMED,
      });

      expect(pendingReservation.status).toBe(ReservationStatus.CONFIRMED);
    });

    it('should decrement seatsTaken when canceling CONFIRMED reservation', async () => {
      const confirmedReservation = {
        ...mockReservation,
        status: ReservationStatus.CONFIRMED,
        eventId: { toString: () => mockEvent._id },
      };
      const eventWithSeats = { ...mockEvent, seatsTaken: 5 };

      mockReservationModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(confirmedReservation),
      });
      confirmedReservation.save = jest
        .fn()
        .mockResolvedValue(confirmedReservation);
      mockEventsService.findOne.mockResolvedValue(eventWithSeats);
      mockEventsService.update.mockResolvedValue({
        ...eventWithSeats,
        seatsTaken: 4,
      });
      confirmedReservation.populate = jest
        .fn()
        .mockResolvedValue(confirmedReservation);

      await service.updateStatus(reservationId, {
        status: ReservationStatus.CANCELED,
      });

      expect(mockEventsService.update).toHaveBeenCalledWith(mockEvent._id, {
        seatsTaken: 4,
      });
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(
        service.updateStatus('invalid-id', {
          status: ReservationStatus.CONFIRMED,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if reservation not found', async () => {
      mockReservationModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.updateStatus(reservationId, {
          status: ReservationStatus.CONFIRMED,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
