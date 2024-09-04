import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { GetUserUniqueUseCase } from "@/use-cases/user/get-user-unique";

export function makeGetUserUniqueUseCase(){
    const playersRepository = new PrismaUsersRepository()
    const getUserUniqueUseCase = new GetUserUniqueUseCase(playersRepository)

    return getUserUniqueUseCase
}