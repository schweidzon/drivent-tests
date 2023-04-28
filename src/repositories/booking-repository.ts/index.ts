import { prisma } from "@/config"
import { Booking } from "@prisma/client"

async function createBooking(roomId: number, userId: number): Promise<Booking>  {
   return prisma.booking.create({
    data: {
        roomId,
        userId,
    }
   })
}

const bookingRepository = {
    createBooking
}

export default bookingRepository