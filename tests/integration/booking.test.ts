import supertest from 'supertest';
import { Booking, TicketStatus } from '@prisma/client';
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
  createEvent,
  createRoomWithCapacityOne,
} from '../factories';
import { cleanDb, generateRandomId, generateValidToken } from '../helpers';
import app, { init } from '@/app';
import { createBooking } from '../factories/booking-factory';

beforeAll(async () => {
  await init();
  await cleanDb();
});

beforeEach(async () => {
  await createEvent()
})

afterEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  describe('When token is valid', () => {
    it("Should respond with status 404 if user doesn't have a reserve", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);


      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404)

    })
    it("Should respond with status 200,the booking id and the room information when success", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const userEnrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(userEnrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);
      const booking = await createBooking(room.id, user.id)

      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200)
      expect(response.body).toEqual(expect.objectContaining({
        id: booking.id,
        Room: expect.objectContaining({
          id: room.id,
          name: room.name,
          capacity: room.capacity,
          hotelId: room.hotelId,
          createdAt: room.createdAt.toISOString(),
          updatedAt: room.updatedAt.toISOString()
        })
      }))
    })
  })

})

describe("POST /booking", () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.post('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  describe('When token is valid', () => {
    describe("Should respond with status 403 if ticket status is not PAID, ticket is remote or doesn't includes hotel", () => {
      it('If ticket status it not PAID', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const userEnrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithHotel();
        await createTicket(userEnrollment.id, ticketType.id, TicketStatus.RESERVED);
        const hotel = await createHotel();
        const room = await createRoom(hotel.id);


        const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });

        expect(response.status).toBe(403);
      });
      it('If ticket status is paid but ticket is remote', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const userEnrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createRemoteTicketType();
        await createTicket(userEnrollment.id, ticketType.id, TicketStatus.PAID);
        const hotel = await createHotel();
        const room = await createRoom(hotel.id);


        const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });

        expect(response.status).toBe(403);
      });
      it("If ticket status is paid, ticket isn't remote but doesn't includes hotel", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const userEnrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWihoutHotel();
        await createTicket(userEnrollment.id, ticketType.id, TicketStatus.PAID);
        const hotel = await createHotel();
        const room = await createRoom(hotel.id);

        const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });

        expect(response.status).toBe(403);
      });
    });
    it("Should respod with status 404 if roomId doesn't exists", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const userEnrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(userEnrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);
     

      const response = await server.post(`/booking`).set('Authorization', `Bearer ${token}`).send({ roomId: 0 });

      expect(response.status).toBe(404);

    })
    it("Should respod with status 403 if room doesn't have anymore capacity available", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const userEnrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(userEnrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createRoomWithCapacityOne(hotel.id);

      await createBooking(room.id, user.id)


      const response = await server.post(`/booking`).set('Authorization', `Bearer ${token}`).send({ roomId: room.id });

      expect(response.status).toBe(403);

    })

    it("Should respond with status 404 if user doesn't have enrollment", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);


      const hotel = await createHotel();
      const room = await createRoom(hotel.id);


      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });

      expect(response.status).toBe(404);


    })
    it("Should respond with status 404 if user doesn't have a ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);
      await createTicketTypeWihoutHotel();
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);


      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });

      expect(response.status).toBe(404);


    })

    it("Should respond with status 200 and the bookingId", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const userEnrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(userEnrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });

      expect(response.status).toBe(200);

      expect(response.body).toEqual(expect.objectContaining({
        bookingId: response.body.bookingId
      }))
    })
  })

})

describe("PUT /booking", () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.post('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("Should respod with status 404 if roomId doesn't exists", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const userEnrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(userEnrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);
      const booking = await createBooking(room.id, user.id)

      const response = await server.put(`/booking/${booking.id}`).set('Authorization', `Bearer ${token}`).send({ roomId: 0 });

      expect(response.status).toBe(404);

    })
    it("Should respod with status 403 if room doesn't have anymore capacity available", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const userEnrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(userEnrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createRoomWithCapacityOne(hotel.id);

      const booking = await createBooking(room.id, user.id)


      const response = await server.put(`/booking/${booking.id}`).set('Authorization', `Bearer ${token}`).send({ roomId: room.id });

      expect(response.status).toBe(403);

    })

    it("Should respod with status 403 if user doesn't have a reserve", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const userEnrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(userEnrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createRoomWithCapacityOne(hotel.id);

      const booking = await createBooking(room.id, user.id + 1)

      const response = await server.put(`/booking/${booking.id}`).set('Authorization', `Bearer ${token}`).send({ roomId: room.id });

      expect(response.status).toBe(403);

    })
  })

  it("Should respod with status 403 if bookingId doesn't exists", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const userEnrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    await createTicket(userEnrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();
    const room = await createRoomWithCapacityOne(hotel.id);

    const response = await server.put(`/booking/${0}`).set('Authorization', `Bearer ${token}`).send({ roomId: room.id });

    expect(response.status).toBe(403);

  })

  it("Should respond with status 200 and the new bookingId when success", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const userEnrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    await createTicket(userEnrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();
    const room1 = await createRoom(hotel.id);
    const room2 = await createRoom(hotel.id);
    const booking = await createBooking(room1.id, user.id)

    const response = await server.put(`/booking/${booking.id}`).set('Authorization', `Bearer ${token}`).send({ roomId: room2.id });

    expect(response.status).toBe(200);

    expect(response.body).toEqual(expect.objectContaining({
      bookingId: response.body.bookingId
    }))
  })

})