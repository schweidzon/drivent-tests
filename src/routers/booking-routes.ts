import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import { bookingSchema } from '@/schemas/booking-schema';
import { createBooking } from '@/controllers/booking-controller';

const bookingRouter = Router();

bookingRouter.post("/", authenticateToken, validateBody(bookingSchema), createBooking)

export {bookingRouter}