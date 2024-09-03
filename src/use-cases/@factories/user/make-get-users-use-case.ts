import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { GetUsersUseCase } from "@/use-cases/user/get-users";

export function makeGetUsersUseCase(){
    const playersRepository = new PrismaUsersRepository()
    const getUsersUseCase = new GetUsersUseCase(playersRepository)

    return getUsersUseCase
}