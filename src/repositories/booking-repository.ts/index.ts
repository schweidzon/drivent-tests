import { Booking } from '@prisma/client';
import { prisma } from '@/config';

async function createBooking(roomId: number, userId: number): Promise<Booking> {
  return prisma.booking.create({
    data: {
      roomId,
      userId,
    },
    include: {
      Room: true,
    },
  });
}

async function checkBooking(userId: number) {
  return prisma.booking.findFirst({
    where: {
      userId,
    },
    select: {
      id: true,
      Room: true,
    },
  });
}

async function checkBookingById(bookingId: number) {
  return prisma.booking.findFirst({
    where: {
      id: bookingId,
    },
  });
}

async function changeBooking(bookingId: number, roomId: number, userId: number) {
  deleteBooking(bookingId);
  return createBooking(roomId, userId);
}

async function deleteBooking(bookingId: number) {
  await prisma.booking.delete({
    where: {
      id: bookingId,
    },
  });
}
const bookingRepository = {
  createBooking,
  checkBooking,
  changeBooking,
  checkBookingById,
};

export default bookingRepository;
