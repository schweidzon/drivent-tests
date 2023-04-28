import { prisma } from "@/config"
import { Booking } from "@prisma/client"

async function createBooking(roomId: number, userId: number): Promise<Booking> {
    return prisma.booking.create({
        data: {
            roomId,
            userId,
        }
    })
}

async function checkBooking(userId: number) {
    return prisma.booking.findMany({
        where: {
            userId
        },
        select: {
            id: true,
            Room: true
        }
    })
}

const bookingRepository = {
    createBooking,
    checkBooking
}

export default bookingRepository