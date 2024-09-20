import { UsersRepository } from "@/repositories/users-repository";
import { User } from "@prisma/client";
import { UserNotExistsError } from "../@errors/user-not-exists";

interface GetProfileRequest {
    id: string;
}

interface GetProfileResponse {
    user: {
        id: string;
        name: string;
        email: string;
        date_created: Date;
        status: string;
        sector: string;
    }
}

export class GetProfileUseCase {
    constructor(private usersRepository: UsersRepository) {}

    async execute ({ id }: GetProfileRequest): Promise<GetProfileResponse> {
        
        const user = await this.usersRepository.getUser(id);
        if(!user) throw new UserNotExistsError()

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                date_created: user.date_created,
                status: user.status,
                sector: user.sector
            }
        }
    }
}