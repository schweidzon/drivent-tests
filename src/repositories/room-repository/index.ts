import { prisma } from "@/config"

async function findById(roomId: number) {
    return prisma.room.findFirst({
        where: {
            id: roomId
        },
        include: {
            Booking: true
        }
    })
}

export default {findById}