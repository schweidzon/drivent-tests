import dayjs from 'dayjs';
import faker from '@faker-js/faker';
import { Hotel, Room } from '@prisma/client';
import { prisma } from '@/config';

export function createHotel(params: Partial<Hotel> = {}): Promise<Hotel> {
    return prisma.hotel.create({
        data: {
            name: params.name || faker.lorem.sentence(),
            image: params.image || faker.image.imageUrl(),
            createdAt: params.createdAt || dayjs().subtract(1, 'day').toDate(),
            updatedAt: params.createdAt || dayjs().subtract(1, 'day').toDate(),
        },
    });
}

export function createRoom(hotelId: number): Promise<Room> {
    return prisma.room.create({
        data: {
            name: faker.lorem.sentence(),
            capacity:  faker.datatype.number(),
            hotelId: hotelId,
            createdAt:  dayjs().subtract(1, 'day').toDate(),
            updatedAt:  dayjs().subtract(1, 'day').toDate(),
        },
    });
}

