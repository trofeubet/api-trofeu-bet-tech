import { UsersRepository } from "@/repositories/users-repository";
import { User } from "@prisma/client";
import { UserNotExistsError } from "../@errors/user-not-exists";

interface GetUserRequest {
    id: string;
}

interface GetUserResponse {
    user: User
}

export class GetUserUseCase {
    constructor(private usersRepository: UsersRepository) {}

    async execute ({ id }: GetUserRequest): Promise<GetUserResponse> {
        
        const user = await this.usersRepository.getUser(id);
        if(!user) throw new UserNotExistsError()

        return {
            user
        }
    }
}