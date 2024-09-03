import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { GetProfileUseCase } from "@/use-cases/user/profile-user";

export function makeGetProfileUseCase() {
    const usersRepository = new PrismaUsersRepository()
    const getUsersUseCase = new GetProfileUseCase(usersRepository)

    return getUsersUseCase
}