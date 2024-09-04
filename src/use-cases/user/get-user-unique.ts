import { UsersRepository } from "@/repositories/users-repository";
import { User, Sectores, Status } from "@prisma/client";
import { UserNotExistsError } from "../@errors/user-not-exists";

interface getUserUniqueUseCaseRequest {
    id: string;
}

interface getUserUniqueUseCaseResponse {
    user: {
        id: string;
        name: string;
        gender: string;
        email: string;
        status: Status;
        date_created: Date;
        sector: Sectores;
    }
}

export class GetUserUniqueUseCase {
    constructor(
        private usersRepository: UsersRepository
    ) {}
    
    async execute({
        id
    }: getUserUniqueUseCaseRequest): Promise<getUserUniqueUseCaseResponse> {
        const userData = await this.usersRepository.getUniqueUser(id);
        if (!userData) throw new UserNotExistsError();

        return { 
            user: {
                id: userData.id,
                name: userData.name,
                gender: userData.gender,
                email: userData.email,
                status: userData.status,
                date_created: userData.date_created,
                sector: userData.sector
            }
        };
    }
}
