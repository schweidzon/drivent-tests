import { prisma } from "@/config"


async function getAllHotels() {
   return prisma.hotel.findMany({
    include: {
        Rooms: true
    }
   })
}

const hotelRepository = {
    getAllHotels
}

export default hotelRepository