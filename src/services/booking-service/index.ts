import { notFoundError } from "@/errors"
import { ForbiddenError } from "@/errors/forbidden--error"
import bookingRepository from "@/repositories/booking-repository.ts"
import roomRepository from "@/repositories/room-repository"
import { Booking } from "@prisma/client"



async function createBooking(roomId: number, userId: number): Promise<Booking> {
    const checkRoom = await roomRepository.findById(roomId)
    if (!checkRoom) throw notFoundError()
    if (checkRoom.capacity === checkRoom.Booking.length) throw ForbiddenError()
    const booking = await bookingRepository.createBooking(roomId, userId)
    return booking
}

async function checkBooking(userId: number) {
    const checkBooking = await bookingRepository.checkBooking(userId)
    if(!checkBooking) throw notFoundError()
    return checkBooking
}

const bookingService = {
    createBooking,
    checkBooking
}

export default bookingService