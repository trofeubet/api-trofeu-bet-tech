import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { AuthenticateUserUseCase } from "@/use-cases/user/authenticate";

export function makeAuthenticateUserUseCase(){
    const usersRepository = new PrismaUsersRepository()
    const authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository)

    return authenticateUserUseCase
}