import supertest from 'supertest';
import { TicketStatus } from '@prisma/client';
import httpStatus from 'http-status';
import faker from '@faker-js/faker';
import * as jwt from 'jsonwebtoken';
import {
  createEnrollmentWithAddress,
  createTicket,
  createTicketType,
  createTicketTypeWithHotel,
  createUser,
  createHotel,
  createRoom,
  createTicketTypeWihoutHotel,
  createRemoteTicketType,
} from '../factories';
import { cleanDb, generateRandomId, generateValidToken } from '../helpers';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
  await cleanDb();
});

afterEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET /hotels', () => {
  //case 1 : if enrollment doesn't exists return status 404

  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/enrollments');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/enrollments').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/enrollments').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('When token is valid', () => {
    it('Should respond with status 404  if enrollment does not exists', async () => {
      const token = await generateValidToken();
      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
    //case 2: if dont find any ticket return status 404
    it('Should respond with status 404 if ticket does not exists', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
    it('Should respond with status 404 if no hotels if found', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const userEnrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(userEnrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    describe("Should respond with status 402 if ticket status is not PAID, ticket is remote or doesn't includes hotel", () => {
      it('If ticket status it not PAID', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const userEnrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketType();
        await createTicket(userEnrollment.id, ticketType.id, TicketStatus.RESERVED);

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(402);
      });
      it('If ticket status is paid but ticket is remote', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const userEnrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createRemoteTicketType();
        await createTicket(userEnrollment.id, ticketType.id, TicketStatus.PAID);

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(402);
      });
      it("If ticket status is paid, ticket isn't remote but doesn't includes hotel", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const userEnrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWihoutHotel();
        await createTicket(userEnrollment.id, ticketType.id, TicketStatus.PAID);

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(402);
      });
    });

    it('Should respond with status 200 and the hotels when success', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const userEnrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(userEnrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: hotel.id,
            name: hotel.name,
            image: hotel.image,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            Rooms: expect.arrayContaining([
              expect.objectContaining(
                {
                  id: room.id,
                  name: room.name,
                  capacity: room.capacity,
                  hotelId: room.hotelId,
                  createdAt: expect.any(String),
                  updatedAt: expect.any(String),
                } || [],
              ),
            ]),
          }),
        ]),
      );
    });
  });
});

describe('GET /hotels/:id', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/enrollments');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/enrollments').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/enrollments').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('Should respond with status 404  if enrollment does not exists', async () => {
    const hotel = await createHotel();
    const token = await generateValidToken();
    const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
  });
  //case 2: if dont find any ticket return status 404
  it('Should respond with status 404 if ticket does not exists', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    await createEnrollmentWithAddress(user);
    const hotel = await createHotel();

    const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
  });
  it('Should respond with status 404 if no hotels if found', async () => {
    const hotelId = generateRandomId(0, 999999999);
    const user = await createUser();
    const token = await generateValidToken(user);
    const userEnrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    await createTicket(userEnrollment.id, ticketType.id, TicketStatus.PAID);

    const response = await server.get(`/hotels/${hotelId}`).set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(404);
  });

  describe("Should respond with status 402 if ticket status is not PAID, ticket is remote or doesn't includes hotel", () => {
    it('If ticket status it not PAID', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const userEnrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      await createTicket(userEnrollment.id, ticketType.id, TicketStatus.RESERVED);
      const hotel = await createHotel();

      const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(402);
    });
    it('If ticket status is paid but ticket is remote', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const userEnrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createRemoteTicketType();
      await createTicket(userEnrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();

      const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(402);
    });
    it("If ticket status is paid, ticket isn't remote but doesn't includes hotel", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const userEnrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWihoutHotel();
      await createTicket(userEnrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();

      const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(402);
    });
  });

  it('Should respond with status 200 and the hotel when success', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const userEnrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    await createTicket(userEnrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();
    const room = await createRoom(hotel.id);
    const room2 = await createRoom(hotel.id);

    const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: hotel.id,
        name: hotel.name,
        image: hotel.image,
        createdAt: hotel.createdAt.toISOString(),
        updatedAt: hotel.updatedAt.toISOString(),
        Rooms: expect.arrayContaining([
          expect.objectContaining(
            {
              id: room.id,
              name: room.name,
              capacity: room.capacity,
              hotelId: room.hotelId,
              createdAt: room.createdAt.toISOString(),
              updatedAt: room.updatedAt.toISOString(),
            } || [],
          ),
        ]),
      }),
    );
  });
});
