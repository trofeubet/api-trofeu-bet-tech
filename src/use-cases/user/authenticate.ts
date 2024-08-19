import { UsersRepository } from "@/repositories/users-repository";
import { compare, hash } from "bcryptjs";
import { UserAlreadyExistsError } from "../errors/user-already-exists";
import { User } from "@prisma/client";
import { InvalidCredentialsError } from "../errors/invalid-credentials-error";
import { UserInactive } from "../errors/user-inactive";

interface AuthenticateUserRequest {
    email: string;
    password: string;
}

interface AuthenticateUserResponse {
    user: User
}

export class AuthenticateUserUseCase {
    constructor(private usersRepository: UsersRepository) {}

    async execute ({ email, password }: AuthenticateUserRequest): Promise<AuthenticateUserResponse> {

        const user = await this.usersRepository.findByEmail(email)
    
        if(!user) throw new InvalidCredentialsError()
        if(user.status === "INACTIVE") throw new UserInactive()
        
        const doesPasswordMatches = await compare(password, user.password)

        if(!doesPasswordMatches) throw new InvalidCredentialsError()
        
        return {
            user
        }
    }
}