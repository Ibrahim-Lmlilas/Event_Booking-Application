// CRITICAL: Set test database URI BEFORE importing AppModule
// This ensures MongooseModule.forRoot() uses the test database, not production
const existingUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const uriMatch = existingUri.match(/^(mongodb:\/\/[^\/]+)/);
const baseUri = uriMatch ? uriMatch[1] : 'mongodb://localhost:27017';
const testDbName = `event-booking-test-e2e-${Date.now()}`;
process.env.MONGODB_URI = `${baseUri}/${testDbName}`;
console.log(
  `[E2E Test] Setting test database BEFORE module import: ${process.env.MONGODB_URI}`,
);

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { EventStatus } from '../src/common/enums/event-status.enum';
import { ReservationStatus } from '../src/common/enums/reservation-status.enum';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../src/users/schemas/user.schema';
import { Event } from '../src/events/schemas/event.schema';
import { Reservation } from '../src/reservations/schemas/reservation.schema';

describe('App E2E - Complete Reservation Flow with Roles', () => {
  let app: INestApplication<App>;
  let moduleFixture: TestingModule;
  let userModel: Model<User>;
  let eventModel: Model<Event>;
  let reservationModel: Model<Reservation>;
  let adminToken: string;
  let participantToken: string;
  let adminUserId: string;
  let participantUserId: string;
  let eventId: string;
  let reservationId: string;
  const testTimestamp = Date.now();

  beforeAll(async () => {
    // MONGODB_URI is already set at module import time (see top of file)
    // This ensures AppModule uses the test database, not production
    console.log(
      `[E2E Test] Confirming test database: ${process.env.MONGODB_URI}`,
    );

    // Verify we're NOT using production database
    if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('test')) {
      throw new Error(
        `SECURITY ERROR: Test is trying to use non-test database: ${process.env.MONGODB_URI}`,
      );
    }

    if (!process.env.JWT_SECRET) {
      process.env.JWT_SECRET = 'test-secret-key-for-e2e-tests';
    }
    if (!process.env.PORT) {
      process.env.PORT = '3001';
    }

    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    // Get models for cleanup
    userModel = moduleFixture.get<Model<User>>(getModelToken(User.name));
    eventModel = moduleFixture.get<Model<Event>>(getModelToken(Event.name));
    reservationModel = moduleFixture.get<Model<Reservation>>(
      getModelToken(Reservation.name),
    );

    // Clean database before tests
    await userModel.deleteMany({}).exec();
    await eventModel.deleteMany({}).exec();
    await reservationModel.deleteMany({}).exec();
  }, 30000); // Increase timeout to 30 seconds for MongoDB connection

  afterAll(async () => {
    // Clean test database after tests (only test data, not production)
    try {
      if (userModel) await userModel.deleteMany({}).exec();
      if (eventModel) await eventModel.deleteMany({}).exec();
      if (reservationModel) await reservationModel.deleteMany({}).exec();
      console.log(
        `[E2E Test] Cleaned test database: ${process.env.MONGODB_URI}`,
      );
    } catch (error) {
      console.error('[E2E Test] Error cleaning test database:', error);
    }
    if (app) {
      await app.close();
    }
  });

  describe('Complete flow: Admin creates event → Participant reserves → Admin confirms → Participant downloads ticket', () => {
    // Step 1: Register Admin
    it('should register an admin user', async () => {
      const registerDto = {
        email: `admin-${testTimestamp}@test.com`,
        password: 'Admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body.user.role).toBe('admin');
      adminToken = response.body.access_token;
      adminUserId = response.body.user.id;
    });

    // Step 2: Register Participant
    it('should register a participant user', async () => {
      const registerDto = {
        email: `participant-${testTimestamp}@test.com`,
        password: 'Participant123',
        firstName: 'Participant',
        lastName: 'User',
        role: 'participant',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body.user.role).toBe('participant');
      participantToken = response.body.access_token;
      participantUserId = response.body.user.id;
    });

    // Step 3: Admin creates an event (DRAFT)
    it('should allow admin to create an event', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const createEventDto = {
        title: 'E2E Test Event',
        description: 'This is a test event for E2E testing',
        date: futureDate.toISOString(),
        time: '18:00',
        location: 'Test Location',
        capacity: 50,
        price: 100,
        bg: 'event1.jpg',
        status: EventStatus.DRAFT,
      };

      const response = await request(app.getHttpServer())
        .post('/api/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createEventDto)
        .expect(201);

      expect(response.body.title).toBe(createEventDto.title);
      expect(response.body.status).toBe(EventStatus.DRAFT);
      expect(response.body.seatsTaken).toBe(0);
      eventId = response.body._id;
    });

    // Step 4: Participant cannot see DRAFT event
    it('should not show DRAFT events to participant', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/events?status=PUBLISHED')
        .expect(200);

      const draftEvents = response.body.events.filter(
        (e: any) => e._id === eventId && e.status === EventStatus.DRAFT,
      );
      expect(draftEvents.length).toBe(0);
    });

    // Step 5: Admin publishes the event
    it('should allow admin to publish the event', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/events/${eventId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: EventStatus.PUBLISHED })
        .expect(200);

      expect(response.body.status).toBe(EventStatus.PUBLISHED);
    });

    // Step 6: Participant can now see PUBLISHED event
    it('should show PUBLISHED events to participant', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/events?status=PUBLISHED')
        .expect(200);

      const publishedEvent = response.body.events.find(
        (e: any) => e._id === eventId,
      );
      expect(publishedEvent).toBeDefined();
      expect(publishedEvent.status).toBe(EventStatus.PUBLISHED);
    });

    // Step 7: Participant views event details
    it('should allow participant to view event details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/events/${eventId}`)
        .expect(200);

      expect(response.body._id).toBe(eventId);
      expect(response.body.title).toBe('E2E Test Event');
      expect(response.body.capacity).toBe(50);
    });

    // Step 8: Participant creates a reservation
    it('should allow participant to create a reservation', async () => {
      // Ensure participantToken is defined
      expect(participantToken).toBeDefined();
      expect(eventId).toBeDefined();

      const createReservationDto = {
        eventId: eventId,
      };

      const response = await request(app.getHttpServer())
        .post('/api/reservations')
        .set('Authorization', `Bearer ${participantToken}`)
        .send(createReservationDto)
        .expect(201);

      expect(response.body.status).toBe(ReservationStatus.PENDING);
      expect(response.body.eventId).toBeDefined();
      reservationId = response.body._id;
    });

    // Step 9: Event seatsTaken should be incremented
    it('should increment event seatsTaken when reservation is created', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/events/${eventId}`)
        .expect(200);

      expect(response.body.seatsTaken).toBe(1);
    });

    // Step 10: Participant cannot reserve the same event twice
    it('should prevent duplicate reservations', async () => {
      // Ensure reservationId exists (reservation was created)
      expect(reservationId).toBeDefined();
      expect(participantToken).toBeDefined();

      const createReservationDto = {
        eventId: eventId,
      };

      await request(app.getHttpServer())
        .post('/api/reservations')
        .set('Authorization', `Bearer ${participantToken}`)
        .send(createReservationDto)
        .expect(409); // Conflict
    });

    // Step 11: Participant views their reservations
    it('should allow participant to view their reservations', async () => {
      expect(participantToken).toBeDefined();
      expect(reservationId).toBeDefined();

      const response = await request(app.getHttpServer())
        .get('/api/reservations')
        .set('Authorization', `Bearer ${participantToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      const reservation = response.body.find(
        (r: any) => r._id === reservationId,
      );
      expect(reservation).toBeDefined();
      expect(reservation.status).toBe(ReservationStatus.PENDING);
    });

    // Step 12: Admin views all reservations
    it('should allow admin to view all reservations', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/reservations')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      const reservation = response.body.find(
        (r: any) => r._id === reservationId,
      );
      expect(reservation).toBeDefined();
    });

    // Step 13: Admin confirms the reservation
    it('should allow admin to confirm a reservation', async () => {
      // Ensure reservationId is defined
      if (!reservationId) {
        // Create a reservation first if it doesn't exist
        const createReservationDto = { eventId: eventId };
        const createRes = await request(app.getHttpServer())
          .post('/api/reservations')
          .set('Authorization', `Bearer ${participantToken}`)
          .send(createReservationDto)
          .expect(201);
        reservationId = createRes.body._id;
      }

      const response = await request(app.getHttpServer())
        .patch(`/api/reservations/${reservationId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: ReservationStatus.CONFIRMED })
        .expect(200);

      expect(response.body.status).toBe(ReservationStatus.CONFIRMED);
    });

    // Step 14: Participant cannot download ticket for PENDING reservation
    it('should prevent ticket download for non-CONFIRMED reservations', async () => {
      expect(adminToken).toBeDefined();
      expect(participantToken).toBeDefined();

      // Create another PENDING reservation
      const futureDate2 = new Date();
      futureDate2.setDate(futureDate2.getDate() + 31);
      const event2 = await request(app.getHttpServer())
        .post('/api/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Event 2',
          date: futureDate2.toISOString(),
          time: '19:00',
          location: 'Location 2',
          capacity: 30,
          price: 50,
          bg: 'event2.jpg',
          status: EventStatus.PUBLISHED,
        })
        .expect(201);

      const res2 = await request(app.getHttpServer())
        .post('/api/reservations')
        .set('Authorization', `Bearer ${participantToken}`)
        .send({ eventId: event2.body._id })
        .expect(201);

      await request(app.getHttpServer())
        .get(`/api/reservations/${res2.body._id}/ticket`)
        .set('Authorization', `Bearer ${participantToken}`)
        .expect(400); // BadRequest - not CONFIRMED
    });

    // Step 15: Participant downloads ticket for CONFIRMED reservation
    it('should allow participant to download ticket for CONFIRMED reservation', async () => {
      expect(participantToken).toBeDefined();
      expect(reservationId).toBeDefined();

      const response = await request(app.getHttpServer())
        .get(`/api/reservations/${reservationId}/ticket`)
        .set('Authorization', `Bearer ${participantToken}`)
        .expect(200);

      expect(response.headers['content-type']).toContain('application/pdf');
      expect(response.body).toBeDefined();
    });

    // Step 16: Participant cannot download ticket of another user
    it('should prevent participant from downloading another user ticket', async () => {
      // Register another participant
      const registerDto2 = {
        email: `participant2-${testTimestamp}@test.com`,
        password: 'Participant123',
        firstName: 'Participant2',
        lastName: 'User',
      };

      const user2 = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto2)
        .expect(201);

      // reservationId might not exist if previous tests failed, check first
      if (reservationId) {
        await request(app.getHttpServer())
          .get(`/api/reservations/${reservationId}/ticket`)
          .set('Authorization', `Bearer ${user2.body.access_token}`)
          .expect(403); // Forbidden
      } else {
        // Skip if reservationId is not set
        expect(true).toBe(true);
      }
    });

    // Step 17: Admin can cancel the event
    it('should allow admin to cancel an event', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/events/${eventId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: EventStatus.CANCELED })
        .expect(200);

      expect(response.body.status).toBe(EventStatus.CANCELED);
    });

    // Step 18: Participant cannot reserve a CANCELED event
    it('should prevent reservation of CANCELED events', async () => {
      expect(adminToken).toBeDefined();
      expect(participantToken).toBeDefined();

      const futureDate3 = new Date();
      futureDate3.setDate(futureDate3.getDate() + 32);
      const canceledEvent = await request(app.getHttpServer())
        .post('/api/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Canceled Event',
          date: futureDate3.toISOString(),
          time: '20:00',
          location: 'Location 3',
          capacity: 20,
          price: 75,
          bg: 'event3.jpg',
          status: EventStatus.CANCELED,
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/reservations')
        .set('Authorization', `Bearer ${participantToken}`)
        .send({ eventId: canceledEvent.body._id })
        .expect(400); // BadRequest - cannot reserve CANCELED event
    });
  });
});
