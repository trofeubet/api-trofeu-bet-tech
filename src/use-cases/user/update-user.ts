import { UsersRepository } from "@/repositories/users-repository";
import { User, Status, Sectores } from "@prisma/client";
import { UserNotExistsError } from "../@errors/user-not-exists";

interface UpdateUserRequest {
    id: string;
    name?: string;
    gender?: string;
    email?: string;
    status?: Status;
    sector?: Sectores;
}

interface UpdateUserResponse {
    updateUser: User
}

export class UpdateUserUseCase {
    constructor(private usersRepository: UsersRepository) {}

    async execute ({ id, name, gender, email, status, sector }: UpdateUserRequest): Promise<UpdateUserResponse> {
        
        const user = await this.usersRepository.getUser(id);
        if(!user) throw new UserNotExistsError()

        const updateUser = await this.usersRepository.updateUser(user.id, {
            name,
            gender,
            email,
            status,
            sector
        })
        if(!updateUser) throw new Error ("Erro ao atualizar usuário!")

        return {
            updateUser
        }
    }
}