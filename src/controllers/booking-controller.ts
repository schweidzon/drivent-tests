import { AuthenticatedRequest } from "@/middlewares";
import bookingService from "@/services/booking-service";
import { NextFunction, Response } from "express";

export async function createBooking(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const roomId = req.body.roomId as number
    const userId = req.userId;

    try {
        const booking = await bookingService.createBooking(roomId, userId)
       
        return res.send({bookingId: booking.id})
    } catch (error) {
        console.log(error)
        next(error)
    }
    
}

export async function checkBooking(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const userId = req.userId;

    try {
        const booking = await bookingService.checkBooking(userId)
        return res.send(booking)
    } catch (error) {
        console.log(error)
        next(error)
    }
}

export async function changeBooking(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const roomId = req.body.roomId as number
    const bookingId = parseInt(req.params.bookingId)
    const userId = req.userId;
    try {
        const booking = await bookingService.changeBooking(bookingId, userId, roomId)
        
        return res.send({bookingId: booking.id})
    } catch (error) {
        console.log(error)
        next(error)
    }

}