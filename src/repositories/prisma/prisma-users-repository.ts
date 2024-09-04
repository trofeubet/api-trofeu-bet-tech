import { prisma } from '@/lib/prisma'
import { Prisma, Sectores, User } from '@prisma/client'
import { UsersRepository } from '../users-repository'

export class PrismaUsersRepository implements UsersRepository {
    async create(data: Prisma.UserCreateInput) {
        const user = await prisma.user.create({
            data
        })
        
        return user
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await prisma.user.findUnique({
            where: {
                email
            }
        })

        return user
    }

    async getUser(id: string): Promise<User | null> {
        const user = await prisma.user.findUnique({
            where: {
                id
            }
        })

        return user
    }

    async updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User> {
        const user = await prisma.user.update({
            where: {
                id
            },
            data
        })

        return user
    }

    async getUsers(take: number, page: number, name?: string, email?: string): Promise<{ users: User[]; totalCount: number; }> {
        const skip = (page - 1) * take;

        const conditions: Prisma.UserWhereInput[] = [];

        if (name) conditions.push({ name: { contains: name, mode: 'insensitive' } });
        // if (sector) conditions.push({ sector: { equals: sector } });
        if (email) conditions.push({ email: { contains: email, mode: 'insensitive' } });

        const users = await prisma.user.findMany({
            where: {
                AND: conditions
            },
            take,
            skip
        });

        const totalCount = await prisma.user.count({
            where: {
                AND: conditions
            }
        });

        return { users, totalCount };
    }

    async getUniqueUser(id: string): Promise<User | null> {
        const user = await prisma.user.findUnique({
            where: {
                id
            }
        })

        return user
    }
}