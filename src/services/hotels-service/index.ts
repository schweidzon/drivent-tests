import { notFoundError, unauthorizedError } from "@/errors"
import { paymentRequiredError } from "@/errors/payment-required-error"
import enrollmentRepository from "@/repositories/enrollment-repository"
import hotelRepository from "@/repositories/hotels-repository"
import ticketsRepository from "@/repositories/tickets-repository"


async function validateInfos(userId: number) {

  const checkEnrollment = await enrollmentRepository.findWithAddressByUserId(userId)
  //case 1 : if enrollment doesn't exists return status 404
  if (!checkEnrollment) throw notFoundError()

  const checkTicket = await ticketsRepository.getTicketByEnrollmentId(checkEnrollment)
  //case 2: if dont find any ticket return status 404
  if (!checkTicket) throw notFoundError()
  //case 3: if ticket status isn't paid return status 402
  if (checkTicket.status !== "PAID") throw paymentRequiredError()
  const checkTickeType = await ticketsRepository.getTicketTypeById(checkTicket.ticketTypeId)
  //case 4: if ticketType does not inlcudes hotel, return 402
  if (checkTickeType.includesHotel === false) throw paymentRequiredError()
  //case 5: if ticketType is remote return 402
  if (checkTickeType.isRemote === true) throw paymentRequiredError()



}

async function getAllHotels(userId: number) {
  await validateInfos(userId)
  const hotels = await hotelRepository.getAllHotels()




  if (hotels.length === 0) throw notFoundError()
  return hotels

}

async function getHotelById(hotelId: number, userId: number) {
  await validateInfos(userId)
  const hotel = await hotelRepository.getHotelById(hotelId)
  if (!hotel) throw notFoundError()
  return hotel
}
const hotelService = {
  getAllHotels,
  getHotelById
}

export default hotelService