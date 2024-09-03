import { Prisma, User } from '@prisma/client'

export interface UsersRepository {
    create(data: Prisma.UserCreateInput): Promise<User>
    findByEmail(email: string): Promise<User | null>
    getUser(id: string): Promise<User | null>
    updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User>
    getUsers(take: number, page: number, name?: string, email?: string): Promise<{ users: User[], totalCount: number }>
}