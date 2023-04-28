import { Booking, Hotel, Room } from '@prisma/client';
import { prisma } from '@/config';

export async function createBooking(roomId: number, userId: number): Promise<Booking> {
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
