import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { GetUserUseCase } from "@/use-cases/user/profile-user";

export function makeGetUserUseCase() {
    const usersRepository = new PrismaUsersRepository()
    const getUsersUseCase = new GetUserUseCase(usersRepository)

    return getUsersUseCase
}