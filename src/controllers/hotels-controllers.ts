import { AuthenticatedRequest } from "@/middlewares";
import hotelService from "@/services/hotels-service";
import { NextFunction, Response } from "express";
import httpStatus from "http-status";

export async function getAllHotels(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const userId = req.userId
    try {
        const hotels = await hotelService.getAllHotels(userId)
        //case 5: return status 200 with the hotels
        return res.send(hotels)
        } catch (error) {
            next(error)
    }

}