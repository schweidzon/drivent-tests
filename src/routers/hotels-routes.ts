import { getAllHotels } from '@/controllers/hotels-controllers'
import { authenticateToken } from '@/middlewares'
import { Router } from 'express'


const hotelRoutes = Router()

hotelRoutes.get("/", authenticateToken, getAllHotels)

export { hotelRoutes }