import { getAllHotels, getHotelbyId } from '@/controllers/hotels-controllers'
import { authenticateToken } from '@/middlewares'
import { Router } from 'express'


const hotelRoutes = Router()

hotelRoutes.get("/", authenticateToken, getAllHotels).get("/:hotelId", authenticateToken, getHotelbyId)

export { hotelRoutes }