import { UsersRepository } from "@/repositories/users-repository";
import { User } from "@prisma/client";
import { UserNotExistsError } from "../@errors/user-not-exists";

interface GetProfileRequest {
    id: string;
}

interface GetProfileResponse {
    user: User
}

export class GetProfileUseCase {
    constructor(private usersRepository: UsersRepository) {}

    async execute ({ id }: GetProfileRequest): Promise<GetProfileResponse> {
        
        const user = await this.usersRepository.getUser(id);
        if(!user) throw new UserNotExistsError()

        return {
            user
        }
    }
}