import { notFoundError } from "@/errors"
import { paymentRequiredError } from "@/errors/payment-required-error"
import enrollmentRepository from "@/repositories/enrollment-repository"
import hotelRepository from "@/repositories/hotels-repository"
import ticketsRepository from "@/repositories/tickets-repository"


async function validateInfos(userId: number) {
    const checkEnrollment = await enrollmentRepository.findWithAddressByUserId(userId)

    if (!checkEnrollment) throw notFoundError()
    const checkTicket = await ticketsRepository.getTicketByEnrollmentId(checkEnrollment)
    console.log(checkTicket.status)

    if (checkTicket.status !== "PAID") throw paymentRequiredError()
    const checkTickeType = await ticketsRepository.getTicketTypeById(checkTicket.ticketTypeId)

    if (checkTickeType.includesHotel === false) throw paymentRequiredError()
    if (!checkTicket) throw notFoundError()

}

async function getAllHotels(userId: number) {
    await validateInfos(userId)
    const hotels = await hotelRepository.getAllHotels()
    console.log(hotels)
    if (!hotels) throw notFoundError()
    return hotels

}
const hotelService = {
    getAllHotels
}

export default hotelService