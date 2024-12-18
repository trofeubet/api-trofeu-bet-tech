import { UsersRepository } from "@/repositories/users-repository";
import { Sectores, User } from "@prisma/client";
import { ErrorLoadingPage } from "../@errors/error-loading-page";
import { ErrorLoadingUsers } from "../@errors/error-loading-users";

interface getUsersUseCaseRequest {
    page: number;
    name?: string;
    email?: string;
}

interface getUsersUseCaseResponse {
    usersList: {
        id: string;
        name: string;
        email: string;
        date_created: Date;
        status: string;
        sector: string;
    }[];
    totalItens: number;
    totalPages: number;
    currentPage: number;
}

export class GetUsersUseCase {
    constructor(
        private usersRepository: UsersRepository
    ) {}
    
    async execute({
        page, name, email
    }: getUsersUseCaseRequest): Promise<getUsersUseCaseResponse> {

        if (page <= 0) page = 1;

        const take = 10;
        const { users, totalCount } = await this.usersRepository.getUsers(take, page, name, email);

        if (!users || users.length === 0) {
            return {
                usersList: [],
                totalItens: 0,
                totalPages: 0,
                currentPage: page
            };
        }

        const totalPages = Math.ceil(totalCount / take);
        if (totalPages === 0) throw new ErrorLoadingUsers();
        if (page > totalPages) throw new ErrorLoadingPage();

        //map nos users retirando o password da resposta
        const usersList = users.map(user => {
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                date_created: user.date_created,
                status: user.status,
                sector: Sectores[user.sector]
            };
        })

        return { 
            usersList,
            totalItens: totalCount,
            totalPages,
            currentPage: page
        };
    }
}
