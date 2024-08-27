import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { UpdateUserUseCase } from "@/use-cases/user/update-user";

export function makeUpdateUserUseCase() {
    const usersRepository = new PrismaUsersRepository()
    const updateUsersUseCase = new UpdateUserUseCase(usersRepository)

    return updateUsersUseCase
}