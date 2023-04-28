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
    if (!checkBooking || checkBooking.length === 0) throw notFoundError()
    return checkBooking
}

async function changeBooking(bookingId: number, userId: number, roomId: number) {

    const checkBooking = await bookingRepository.checkBookingById(bookingId)
    
    const checkUserBooking = await bookingRepository.checkBooking(userId)

    const checkRoom = await roomRepository.findById(roomId)

    if (!checkBooking || !checkRoom || !checkUserBooking) throw notFoundError()

    if (checkRoom.capacity === checkRoom.Booking.length) throw ForbiddenError()

    const changedBooking = await bookingRepository.changeBooking(bookingId, roomId, userId)

    return changedBooking
}

const bookingService = {
    createBooking,
    checkBooking,
    changeBooking
}

export default bookingService