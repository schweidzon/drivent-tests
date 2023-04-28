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

const bookingService = {
    createBooking
}

export default bookingService