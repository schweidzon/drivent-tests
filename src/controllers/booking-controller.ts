import { AuthenticatedRequest } from "@/middlewares";
import bookingService from "@/services/booking-service";
import { NextFunction, Response } from "express";

export async function createBooking(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const roomId = req.body.roomId as number
    const userId = req.userId;
    console.log(roomId, userId)

    try {
        const booking = await bookingService.createBooking(roomId, userId)
        const {id: bookingId} = {id: booking.id}
        return res.send({bookingId})
    } catch (error) {
        console.log(error)
        next(error)
    }
    
}