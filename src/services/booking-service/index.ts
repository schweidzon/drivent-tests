import { notFoundError } from "@/errors"
import { ForbiddenError } from "@/errors/forbidden--error"
import bookingRepository from "@/repositories/booking-repository.ts"
import roomRepository from "@/repositories/room-repository"
import { Booking } from "@prisma/client"
import enrollmentRepository from "@/repositories/enrollment-repository"
import ticketsRepository from "@/repositories/tickets-repository"


async function validateInfos(userId: number) {
    const checkEnrollment = await enrollmentRepository.findWithAddressByUserId(userId);

    const checkTicket = await ticketsRepository.getTicketByEnrollmentId(checkEnrollment);

    if (!checkTicket ||!checkEnrollment) throw notFoundError();
    
    const checkTickeType = await ticketsRepository.getTicketTypeById(checkTicket.ticketTypeId);
    if (checkTicket.status !== 'PAID' || checkTickeType.includesHotel === false || checkTickeType.isRemote === true) throw ForbiddenError();
  
  }



async function createBooking(roomId: number, userId: number): Promise<Booking> {
    await validateInfos(userId)
    const checkRoom = await roomRepository.findById(roomId)
    if (!checkRoom) throw notFoundError()
    if (checkRoom.capacity === checkRoom.Booking.length) throw ForbiddenError()
    const booking = await bookingRepository.createBooking(roomId, userId)
    return booking
}

async function checkBooking(userId: number) {
    const checkBooking = await bookingRepository.checkBooking(userId)
    if (!checkBooking) throw notFoundError()
    return checkBooking
}

async function changeBooking(bookingId: number, userId: number, roomId: number) {

    const checkBooking = await bookingRepository.checkBookingById(bookingId)

    const checkUserBooking = await bookingRepository.checkBooking(userId)

    const checkRoom = await roomRepository.findById(roomId)

    if (!checkRoom)  throw notFoundError()

    if (!checkUserBooking || !checkBooking || checkRoom.capacity === checkRoom.Booking.length) throw ForbiddenError()

    const changedBooking = await bookingRepository.changeBooking(bookingId, roomId, userId)

    return changedBooking
}



const bookingService = {
    createBooking,
    checkBooking,
    changeBooking
}

export default bookingService