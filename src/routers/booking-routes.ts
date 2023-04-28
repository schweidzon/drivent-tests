import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import { bookingSchema } from '@/schemas/booking-schema';
import { changeBooking, checkBooking, createBooking } from '@/controllers/booking-controller';

const bookingRouter = Router();

bookingRouter
.use(authenticateToken)
.post("/", validateBody(bookingSchema), createBooking)
.get("/", checkBooking )
.put("/:bookingId", changeBooking)

export {bookingRouter}