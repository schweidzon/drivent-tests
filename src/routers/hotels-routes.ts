import { Router } from 'express';
import { getAllHotels, getHotelbyId } from '@/controllers/hotels-controllers';
import { authenticateToken } from '@/middlewares';

const hotelRoutes = Router();

hotelRoutes.get('/', authenticateToken, getAllHotels).get('/:hotelId', authenticateToken, getHotelbyId);

export { hotelRoutes };
