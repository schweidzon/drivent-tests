import { prisma } from '@/config';

async function getAllHotels() {
  return prisma.hotel.findMany({
    include: {
      Rooms: true,
    },
  });
}

async function getHotelById(hotelId: number) {
  return prisma.hotel.findFirst({
    where: {
      id: hotelId,
    },
    include: {
      Rooms: true,
    },
  });
}

const hotelRepository = {
  getAllHotels,
  getHotelById,
};

export default hotelRepository;
